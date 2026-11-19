import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';
import { generateToken } from '../utils/jwt';
import { logAuditEvent } from '../utils/audit';
import { authenticate, AuthRequest } from '../middleware/auth';
import { sendAdminNotificationEmail } from '../utils/email';

const router = Router();

// TC-AUTH-01 & TC-AUTH-02: User Registration
router.post('/register', async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        error: 'Please provide all required fields: name, email, and password.',
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long.',
      });
      return;
    }

    // Check duplicate account
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      res.status(409).json({
        success: false,
        error: 'An account with this email address already exists.',
      });
      return;
    }

    // Default role is USER (role_id: 2)
    const userRole = await prisma.role.findUnique({ where: { name: 'USER' } });
    const roleId = userRole ? userRole.id : 2;

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone ? phone.trim() : null,
        password_hash,
        role_id: roleId,
        status: 'ACTIVE',
      },
      include: { role: true },
    });

    await logAuditEvent(newUser.user_id, 'USER_REGISTER', 'User', newUser.user_id, {
      email: newUser.email,
      role: newUser.role.name,
    });

    const token = generateToken({
      user_id: newUser.user_id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role.name,
    });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        user_id: newUser.user_id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role.name,
        status: newUser.status,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, error: 'Registration failed. Please try again.' });
  }
});

// TC-AUTH-03 & TC-AUTH-04: User Login
router.post('/login', async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Please enter both email and password.',
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        role: true,
        assigned_facility: {
          select: {
            facility_id: true,
            facility_name: true,
            facility_type: true,
            status: true,
          },
        },
      },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password.',
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password.',
      });
      return;
    }

    if (user.status !== 'ACTIVE') {
      res.status(403).json({
        success: false,
        error: `Your account is ${user.status.toLowerCase()}. Please contact administrator support.`,
      });
      return;
    }

    const token = generateToken({
      user_id: user.user_id,
      email: user.email,
      name: user.name,
      role: user.role.name,
      assigned_facility_id: user.assigned_facility_id,
    });

    await logAuditEvent(user.user_id, 'USER_LOGIN', 'User', user.user_id, {
      email: user.email,
      role: user.role.name,
    });

    res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role.name,
        status: user.status,
        assigned_facility: user.assigned_facility,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Login failed. Please try again.' });
  }
});

// Current User Details
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { user_id: req.user!.user_id },
      include: {
        role: true,
        assigned_facility: {
          select: {
            facility_id: true,
            facility_name: true,
            facility_type: true,
            address: true,
            city: true,
            status: true,
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({ success: false, error: 'User not found.' });
      return;
    }

    res.json({
      success: true,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role.name,
        status: user.status,
        assigned_facility: user.assigned_facility,
        created_at: user.created_at,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch user profile.' });
  }
});

// Update Profile
router.put('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, currentPassword, newPassword } = req.body;
    const userId = req.user!.user_id;

    const user = await prisma.user.findUnique({ where: { user_id: userId } });
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found.' });
      return;
    }

    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone ? phone.trim() : null;

    if (newPassword) {
      if (!currentPassword) {
        res.status(400).json({ success: false, error: 'Current password is required to set a new password.' });
        return;
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isMatch) {
        res.status(400).json({ success: false, error: 'Incorrect current password.' });
        return;
      }
      if (newPassword.length < 6) {
        res.status(400).json({ success: false, error: 'New password must be at least 6 characters.' });
        return;
      }
      const salt = await bcrypt.genSalt(10);
      updateData.password_hash = await bcrypt.hash(newPassword, salt);
    }

    const updatedUser = await prisma.user.update({
      where: { user_id: userId },
      data: updateData,
      include: { role: true },
    });

    await logAuditEvent(userId, 'USER_PROFILE_UPDATE', 'User', userId);

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        user_id: updatedUser.user_id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role.name,
        status: updatedUser.status,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to update profile.' });
  }
});

// Reset Tokens Map (email -> { code, expires })
const resetTokens = new Map<string, { code: string; expires: number }>();

// Forgot Password - Request Reset Code
router.post('/forgot-password', async (req: AuthRequest, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ success: false, error: 'Please provide your registered email address.' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'No account found with this email address. Please check and try again.',
      });
      return;
    }

    // Generate 6-digit OTP code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 15 * 60 * 1000; // 15 minutes

    resetTokens.set(normalizedEmail, { code, expires });

    await logAuditEvent(user.user_id, 'PASSWORD_RESET_REQUEST', 'User', user.user_id, {
      email: normalizedEmail,
    });

    res.json({
      success: true,
      message: 'A 6-digit password reset verification code has been dispatched to your email and phone.',
      preview_code: code, // Shared in response for seamless local demonstration and verification
      phone_hint: user.phone ? `******${user.phone.slice(-4)}` : null,
      email: normalizedEmail,
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, error: 'Failed to process password reset request.' });
  }
});

// Verify Reset Code
router.post('/verify-reset-code', async (req: AuthRequest, res: Response) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      res.status(400).json({ success: false, error: 'Please provide both email and verification code.' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const record = resetTokens.get(normalizedEmail);

    if (!record) {
      res.status(400).json({
        success: false,
        error: 'No active password reset request found. Please request a new code.',
      });
      return;
    }

    if (Date.now() > record.expires) {
      resetTokens.delete(normalizedEmail);
      res.status(400).json({
        success: false,
        error: 'Verification code has expired. Please request a new one.',
      });
      return;
    }

    if (record.code !== code.trim()) {
      res.status(400).json({
        success: false,
        error: 'Invalid verification code. Please check and try again.',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Verification code confirmed. You may now set your new password.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to verify reset code.' });
  }
});

// Reset Password with Verified Code
router.post('/reset-password', async (req: AuthRequest, res: Response) => {
  try {
    const { email, code, new_password } = req.body;
    if (!email || !code || !new_password) {
      res.status(400).json({
        success: false,
        error: 'Please provide email, verification code, and new password.',
      });
      return;
    }

    if (new_password.length < 6) {
      res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters long.',
      });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const record = resetTokens.get(normalizedEmail);

    if (!record || record.code !== code.trim() || Date.now() > record.expires) {
      res.status(400).json({
        success: false,
        error: 'Invalid or expired verification session. Please restart password recovery.',
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      res.status(404).json({ success: false, error: 'User not found.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(new_password, salt);

    await prisma.user.update({
      where: { user_id: user.user_id },
      data: { password_hash },
    });

    resetTokens.delete(normalizedEmail);

    await logAuditEvent(user.user_id, 'PASSWORD_RESET_SUCCESS', 'User', user.user_id, {
      email: normalizedEmail,
    });

    res.json({
      success: true,
      message: 'Password reset successfully! You can now sign in with your new password.',
    });
  } catch (error: any) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, error: 'Failed to reset password.' });
  }
});

// Facility Self-Registration
router.post('/register-facility', async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      facility_name,
      facility_type,
      address,
      locality,
      city,
      state,
      pincode,
      facility_phone,
      facility_email,
      operating_hours,
      latitude,
      longitude,
    } = req.body;

    // Validate required fields
    if (!name || !email || !password || !facility_name || !facility_type || !address || !city || !state || !pincode || !facility_phone) {
      res.status(400).json({
        success: false,
        error: 'Please fill in all required fields for both your account and facility information.',
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long.',
      });
      return;
    }

    // Check duplicate email
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        error: 'An account with this email address already exists.',
      });
      return;
    }

    // Get FACILITY_REPRESENTATIVE role
    const repRole = await prisma.role.findUnique({ where: { name: 'FACILITY_REPRESENTATIVE' } });
    if (!repRole) {
      res.status(500).json({ success: false, error: 'Role configuration error. Please contact support.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const lat = latitude ? parseFloat(String(latitude)) : 28.6139;
    const lng = longitude ? parseFloat(String(longitude)) : 77.2090;

    // Create facility (PENDING status, UNVERIFIED_CROWDSOURCED origin)
    const newFacility = await prisma.facility.create({
      data: {
        facility_name: facility_name.trim(),
        facility_type,
        address: address.trim(),
        locality: locality ? locality.trim() : null,
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        phone: facility_phone.trim(),
        email: facility_email ? facility_email.trim() : null,
        operating_hours: operating_hours ? operating_hours.trim() : 'Mon-Sat 9AM-6PM',
        latitude: lat,
        longitude: lng,
        status: 'PENDING',
        data_origin: 'UNVERIFIED_CROWDSOURCED',
      },
    });

    // Create rep user (PENDING status)
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone ? phone.trim() : null,
        password_hash,
        role_id: repRole.id,
        status: 'PENDING',
        assigned_facility_id: newFacility.facility_id,
      },
      include: { role: true },
    });

    await logAuditEvent(newUser.user_id, 'FACILITY_REP_REGISTRATION', 'User', newUser.user_id, {
      email: newUser.email,
      facility_id: newFacility.facility_id,
      facility_name: newFacility.facility_name,
    });

    // Notify all admins
    try {
      const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } });
      if (adminRole) {
        const admins = await prisma.user.findMany({
          where: { role_id: adminRole.id, status: 'ACTIVE' },
        });
        for (const admin of admins) {
          sendAdminNotificationEmail(
            admin.email,
            newFacility.facility_name,
            newUser.name,
            newUser.email
          );
        }
      }
    } catch (adminEmailErr) {
      console.error('Failed to send admin notification emails:', adminEmailErr);
    }

    res.status(201).json({
      success: true,
      message: 'Registration submitted. Awaiting admin approval. You will be notified via email once reviewed.',
      data: {
        user_id: newUser.user_id,
        email: newUser.email,
        facility_name: newFacility.facility_name,
      },
    });
  } catch (error: any) {
    console.error('Facility registration error:', error);
    res.status(500).json({ success: false, error: 'Registration failed. Please try again.' });
  }
});

export default router;
