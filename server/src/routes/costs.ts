import { Router, Response } from 'express';
import { prisma } from '../config/prisma';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { logAuditEvent } from '../utils/audit';
import { calculateHaversineDistance } from '../utils/haversine';

const router = Router();

// Automated Treatment/Service Cost Comparison ("Healthcare Amazon" Engine)
router.get('/compare-service', async (req, res: Response) => {
  try {
    const {
      service_id,
      service_query,
      city,
      locality,
      lat,
      lng,
      radius,
      facility_type,
      min_price,
      max_price,
      verified_only,
      sort = 'price_asc',
      page = 1,
      limit = 8,
    } = req.query;

    // 1. Fetch all available services for selector pills / dropdown
    const allServices = await prisma.service.findMany({
      orderBy: { name: 'asc' },
    });

    if (allServices.length === 0) {
      res.json({
        success: true,
        service: null,
        all_services: [],
        stats: null,
        facilities: [],
        pagination: { page: 1, limit: Number(limit), total: 0, total_pages: 0, has_more: false },
      });
      return;
    }

    // 2. Identify the active target service
    let activeService: any = null;
    if (service_id) {
      activeService = allServices.find((s) => s.service_id === parseInt(String(service_id), 10));
    }
    if (!activeService && service_query) {
      const q = String(service_query).toLowerCase().trim();
      activeService = allServices.find(
        (s) => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)
      );
    }
    // Default to first service or popular service like MRI / Consultation if not matched
    if (!activeService) {
      activeService =
        allServices.find((s) => s.name.toLowerCase().includes('mri')) ||
        allServices.find((s) => s.name.toLowerCase().includes('consultation')) ||
        allServices[0];
    }

    // 3. Build Facility filter
    const facilityWhere: any = {
      status: { notIn: ['REJECTED', 'ARCHIVED'] },
    };

    if (city && String(city).toUpperCase() !== 'ALL') {
      facilityWhere.city = { contains: String(city) };
    }

    if (locality && String(locality).toUpperCase() !== 'ALL') {
      facilityWhere.locality = { contains: String(locality) };
    }

    if (facility_type && String(facility_type).toUpperCase() !== 'ALL') {
      facilityWhere.facility_type = String(facility_type);
    }

    // Query facilities that offer this service or have cost records for it
    const facilitiesWithData = await prisma.facility.findMany({
      where: facilityWhere,
      include: {
        cost_records: {
          where: { service_id: activeService.service_id },
        },
        facility_services: {
          where: { service_id: activeService.service_id },
        },
      },
    });

    const userLat = lat ? parseFloat(String(lat)) : undefined;
    const userLng = lng ? parseFloat(String(lng)) : undefined;
    const maxRadius = radius ? parseFloat(String(radius)) : undefined;
    const filterMinPrice = min_price ? parseFloat(String(min_price)) : undefined;
    const filterMaxPrice = max_price ? parseFloat(String(max_price)) : undefined;
    const isVerifiedOnly = String(verified_only) === 'true';

    // 4. Process facilities: filter by offering & price, compute distance
    const processedList: any[] = [];

    for (const fac of facilitiesWithData) {
      const isOffered = fac.facility_services.some((fs) => fs.is_available);
      const costRecord = fac.cost_records[0];

      // Must offer the service or have a cost record
      if (!isOffered && !costRecord) continue;

      // Verified only filter
      if (isVerifiedOnly && costRecord?.verification_status !== 'VERIFIED') {
        continue;
      }

      // Compute distance if coordinates provided
      let distanceKm: number | null = null;
      if (userLat !== undefined && userLng !== undefined && fac.latitude && fac.longitude) {
        distanceKm = calculateHaversineDistance(userLat, userLng, fac.latitude, fac.longitude);
        if (maxRadius !== undefined && distanceKm > maxRadius) {
          continue;
        }
      }

      // Budget filter
      if (costRecord) {
        if (filterMinPrice !== undefined && costRecord.amount_max < filterMinPrice) {
          continue;
        }
        if (filterMaxPrice !== undefined && costRecord.amount_min > filterMaxPrice) {
          continue;
        }
      } else if (filterMinPrice !== undefined || filterMaxPrice !== undefined) {
        // If price filter is active and facility has no cost record, exclude
        continue;
      }

      processedList.push({
        facility_id: fac.facility_id,
        facility_name: fac.facility_name,
        facility_type: fac.facility_type,
        address: fac.address,
        locality: fac.locality,
        city: fac.city,
        state: fac.state,
        pincode: fac.pincode,
        latitude: fac.latitude,
        longitude: fac.longitude,
        phone: fac.phone,
        operating_hours: fac.operating_hours,
        status: fac.status,
        data_origin: fac.data_origin,
        distance_km: distanceKm,
        cost_record: costRecord
          ? {
              cost_id: costRecord.cost_id,
              amount_min: costRecord.amount_min,
              amount_max: costRecord.amount_max,
              is_fixed: costRecord.amount_min === costRecord.amount_max,
              formatted_cost:
                costRecord.amount_min === costRecord.amount_max
                  ? `₹${costRecord.amount_min.toLocaleString('en-IN')}`
                  : `₹${costRecord.amount_min.toLocaleString('en-IN')} - ₹${costRecord.amount_max.toLocaleString('en-IN')}`,
              currency: costRecord.currency,
              unit_basis: costRecord.unit_basis,
              source: costRecord.source,
              verification_status: costRecord.verification_status,
              collected_date: costRecord.collected_date,
              verified_at: costRecord.verified_at,
            }
          : null,
      });
    }

    // 5. Compute Stats & Guidance Insights across all valid results
    const facilitiesWithCosts = processedList.filter((f) => f.cost_record !== null);
    let minCost = 0;
    let maxCost = 0;
    let avgCost = 0;
    let potentialSavings = 0;
    let savingsPercentage = 0;
    let cheapestFacilityId: number | null = null;
    let bestValueFacilityId: number | null = null;

    if (facilitiesWithCosts.length > 0) {
      const minAmounts = facilitiesWithCosts.map((f) => f.cost_record.amount_min);
      const maxAmounts = facilitiesWithCosts.map((f) => f.cost_record.amount_max);
      minCost = Math.min(...minAmounts);
      maxCost = Math.max(...maxAmounts);

      const totalMidpoints = facilitiesWithCosts.reduce((acc, f) => {
        return acc + (f.cost_record.amount_min + f.cost_record.amount_max) / 2;
      }, 0);
      avgCost = Math.round(totalMidpoints / facilitiesWithCosts.length);

      potentialSavings = maxCost - minCost;
      savingsPercentage = maxCost > 0 ? Math.round((potentialSavings / maxCost) * 100) : 0;

      // Identify cheapest facility
      const cheapest = facilitiesWithCosts.find((f) => f.cost_record.amount_min === minCost);
      cheapestFacilityId = cheapest ? cheapest.facility_id : null;

      // Identify best value (verified preferred, close to minCost, low distance if available)
      const verifiedOptions = facilitiesWithCosts.filter(
        (f) => f.cost_record.verification_status === 'VERIFIED'
      );
      if (verifiedOptions.length > 0) {
        verifiedOptions.sort((a, b) => a.cost_record.amount_min - b.cost_record.amount_min);
        bestValueFacilityId = verifiedOptions[0].facility_id;
      } else {
        bestValueFacilityId = cheapestFacilityId;
      }
    }

    // Assign badges and percentage differences
    processedList.forEach((fac) => {
      const badges: string[] = [];
      if (fac.cost_record) {
        if (fac.facility_id === cheapestFacilityId) {
          badges.push('LOWEST_PRICE');
        }
        if (fac.facility_id === bestValueFacilityId && fac.facility_id !== cheapestFacilityId) {
          badges.push('BEST_VALUE');
        }
        if (fac.cost_record.verification_status === 'VERIFIED') {
          badges.push('VERIFIED_TARIFF');
        }
        if (avgCost > 0) {
          const mid = (fac.cost_record.amount_min + fac.cost_record.amount_max) / 2;
          const diffPct = Math.round(((avgCost - mid) / avgCost) * 100);
          fac.vs_city_avg_percent = diffPct; // positive means cheaper than average
        }
      }
      if (
        fac.facility_name.toLowerCase().includes('general hospital') ||
        fac.facility_name.toLowerCase().includes('trust') ||
        fac.facility_name.toLowerCase().includes('poona hospital')
      ) {
        badges.push('TRUST_SUBSIDIZED');
      }
      fac.smart_badges = badges;
    });

    // 6. Sort results
    processedList.sort((a, b) => {
      if (sort === 'price_asc') {
        const costA = a.cost_record ? a.cost_record.amount_min : Infinity;
        const costB = b.cost_record ? b.cost_record.amount_min : Infinity;
        return costA - costB;
      } else if (sort === 'price_desc') {
        const costA = a.cost_record ? a.cost_record.amount_max : -1;
        const costB = b.cost_record ? b.cost_record.amount_max : -1;
        return costB - costA;
      } else if (sort === 'distance_asc') {
        const distA = a.distance_km !== null ? a.distance_km : Infinity;
        const distB = b.distance_km !== null ? b.distance_km : Infinity;
        return distA - distB;
      } else {
        return a.facility_name.localeCompare(b.facility_name);
      }
    });

    // 7. Paginate
    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.max(1, parseInt(String(limit), 10) || 8);
    const total = processedList.length;
    const totalPages = Math.ceil(total / limitNum);
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedFacilities = processedList.slice(startIndex, startIndex + limitNum);

    res.json({
      success: true,
      service: activeService,
      all_services: allServices.map((s) => ({
        service_id: s.service_id,
        name: s.name,
        category: s.category,
      })),
      stats: {
        total_providers: facilitiesWithCosts.length,
        min_cost: minCost,
        max_cost: maxCost,
        avg_cost: avgCost,
        potential_savings: potentialSavings,
        savings_percentage: savingsPercentage,
        cheapest_facility_id: cheapestFacilityId,
        best_value_facility_id: bestValueFacilityId,
      },
      facilities: paginatedFacilities,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        total_pages: totalPages,
        has_more: pageNum < totalPages,
      },
      disclaimer:
        'Information shown on MediGuide is for navigation and informational purposes. Approximate costs may change. Always confirm details, availability and final charges with the healthcare facility.',
    });
  } catch (error: any) {
    console.error('Compare service error:', error);
    res.status(500).json({ success: false, error: 'Failed to execute automatic cost comparison.' });
  }
});

// TC-COST-01: Cost Comparison across multiple facilities
router.get('/compare', async (req, res: Response) => {
  try {
    const { facility_ids, service_id } = req.query;

    if (!facility_ids) {
      res.status(400).json({
        success: false,
        error: 'Please select at least two facilities to compare.',
      });
      return;
    }

    const ids = String(facility_ids)
      .split(',')
      .map((id) => parseInt(id.trim(), 10))
      .filter((id) => !isNaN(id));

    if (ids.length < 2) {
      res.status(400).json({
        success: false,
        error: 'Please select at least two valid facilities to compare costs.',
      });
      return;
    }

    // Fetch facilities
    const facilities = await prisma.facility.findMany({
      where: {
        facility_id: { in: ids },
      },
      select: {
        facility_id: true,
        facility_name: true,
        facility_type: true,
        address: true,
        city: true,
        phone: true,
        status: true,
      },
    });

    if (facilities.length === 0) {
      res.status(404).json({ success: false, error: 'No matching facilities found.' });
      return;
    }

    // Build service filter
    const serviceFilter: any = {};
    if (service_id) {
      serviceFilter.service_id = parseInt(String(service_id), 10);
    }

    // Get all relevant services
    const services = await prisma.service.findMany({
      where: serviceFilter,
      orderBy: { name: 'asc' },
    });

    // Fetch all cost records for these facilities
    const costRecords = await prisma.costRecord.findMany({
      where: {
        facility_id: { in: ids },
        ...(service_id ? { service_id: parseInt(String(service_id), 10) } : {}),
      },
      include: {
        service: true,
      },
    });

    // Fetch facility services to know which facilities offer which services
    const facilityServices = await prisma.facilityService.findMany({
      where: {
        facility_id: { in: ids },
      },
    });

    // Build comparison matrix
    const comparisonRows = services.map((svc) => {
      const facilityComparisons: Record<number, any> = {};

      facilities.forEach((fac) => {
        const isOffered = facilityServices.some(
          (fs) => fs.facility_id === fac.facility_id && fs.service_id === svc.service_id
        );

        const record = costRecords.find(
          (c) => c.facility_id === fac.facility_id && c.service_id === svc.service_id
        );

        if (record) {
          facilityComparisons[fac.facility_id] = {
            offered: true,
            cost_available: true,
            amount_min: record.amount_min,
            amount_max: record.amount_max,
            is_fixed: record.amount_min === record.amount_max,
            formatted_cost:
              record.amount_min === record.amount_max
                ? `₹${record.amount_min.toLocaleString('en-IN')}`
                : `₹${record.amount_min.toLocaleString('en-IN')} - ₹${record.amount_max.toLocaleString('en-IN')}`,
            currency: record.currency,
            unit_basis: record.unit_basis,
            source: record.source,
            verification_status: record.verification_status,
            collected_date: record.collected_date,
            verified_at: record.verified_at,
          };
        } else if (isOffered) {
          facilityComparisons[fac.facility_id] = {
            offered: true,
            cost_available: false,
            display_text: 'Cost information unavailable',
          };
        } else {
          facilityComparisons[fac.facility_id] = {
            offered: false,
            cost_available: false,
            display_text: 'Service not offered',
          };
        }
      });

      return {
        service_id: svc.service_id,
        service_name: svc.name,
        service_category: svc.category,
        facilities: facilityComparisons,
      };
    });

    res.json({
      success: true,
      facilities,
      matrix: comparisonRows,
      disclaimer:
        'Information shown on MediGuide is for navigation and informational purposes. Approximate costs may change. Always confirm details, availability and final charges with the healthcare facility.',
    });
  } catch (error: any) {
    console.error('Cost compare error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate cost comparison.' });
  }
});

// TC-COST-02: Submit cost record with strict range validation
router.post(
  '/submit',
  authenticate,
  requireRole('FACILITY_REPRESENTATIVE', 'ADMIN'),
  async (req: AuthRequest, res: Response) => {
    try {
      const {
        facility_id,
        service_id,
        amount_min,
        amount_max,
        currency = 'INR',
        unit_basis = 'per consultation',
        source,
      } = req.body;

      if (!facility_id || !service_id || amount_min === undefined || amount_max === undefined) {
        res.status(400).json({
          success: false,
          error: 'Please provide facility_id, service_id, amount_min, and amount_max.',
        });
        return;
      }

      const min = parseFloat(amount_min);
      const max = parseFloat(amount_max);

      // TC-COST-02 Check: amount_min must not be greater than amount_max
      if (isNaN(min) || isNaN(max) || min < 0 || max < 0) {
        res.status(400).json({
          success: false,
          error: 'Cost amounts must be valid non-negative numbers.',
        });
        return;
      }

      if (min > max) {
        res.status(400).json({
          success: false,
          error: 'Validation failed: Minimum cost cannot be greater than maximum cost.',
        });
        return;
      }

      // If Facility Representative, ensure they are assigned to this facility
      if (req.user!.role === 'FACILITY_REPRESENTATIVE') {
        if (req.user!.assigned_facility_id !== parseInt(facility_id, 10)) {
          res.status(403).json({
            success: false,
            error: 'Unauthorized: You can only submit costs for your assigned healthcare facility.',
          });
          return;
        }
      }

      // Check or create facility_service linkage
      const facId = parseInt(facility_id, 10);
      const svcId = parseInt(service_id, 10);

      await prisma.facilityService.upsert({
        where: {
          facility_id_service_id: {
            facility_id: facId,
            service_id: svcId,
          },
        },
        update: { is_available: true },
        create: {
          facility_id: facId,
          service_id: svcId,
          is_available: true,
        },
      });

      // Admin submissions can be auto-verified, Representative submissions are PENDING
      const verificationStatus = req.user!.role === 'ADMIN' ? 'VERIFIED' : 'PENDING';
      const verifiedAt = req.user!.role === 'ADMIN' ? new Date() : null;
      const verifiedBy = req.user!.role === 'ADMIN' ? req.user!.user_id : null;

      // Upsert cost record
      const existingRecord = await prisma.costRecord.findFirst({
        where: { facility_id: facId, service_id: svcId },
      });

      let costRecord;
      if (existingRecord) {
        costRecord = await prisma.costRecord.update({
          where: { cost_id: existingRecord.cost_id },
          data: {
            amount_min: min,
            amount_max: max,
            currency,
            unit_basis,
            source: source || 'Facility Representative Submission',
            verification_status: verificationStatus,
            verified_at: verifiedAt,
            verified_by: verifiedBy,
            collected_date: new Date(),
          },
        });
      } else {
        costRecord = await prisma.costRecord.create({
          data: {
            facility_id: facId,
            service_id: svcId,
            amount_min: min,
            amount_max: max,
            currency,
            unit_basis,
            source: source || 'Facility Representative Submission',
            verification_status: verificationStatus,
            verified_at: verifiedAt,
            verified_by: verifiedBy,
            collected_date: new Date(),
          },
        });
      }

      await logAuditEvent(
        req.user!.user_id,
        'COST_SUBMIT',
        'CostRecord',
        costRecord.cost_id,
        {
          facility_id: facId,
          service_id: svcId,
          amount_min: min,
          amount_max: max,
          verification_status: verificationStatus,
        }
      );

      res.status(201).json({
        success: true,
        message:
          verificationStatus === 'VERIFIED'
            ? 'Cost record published and verified successfully.'
            : 'Cost record submitted successfully and queued for admin verification.',
        data: costRecord,
      });
    } catch (error: any) {
      console.error('Submit cost error:', error);
      res.status(500).json({ success: false, error: 'Failed to submit cost record.' });
    }
  }
);

export default router;
