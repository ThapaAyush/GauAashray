const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Gaushala = require('../models/Gaushala');
const Branch = require('../models/Branch');

// @desc Get doctors for current Gaushala
// @route GET /api/doctors
exports.getDoctors = async (req, res) => {
  try {
    const gaushala = await Gaushala.findOne({ owner: req.user._id });
    if (!gaushala) {
      return res.status(404).json({ success: false, message: 'Gaushala not found' });
    }

    const { branchId, availability } = req.query;
    const query = { gaushala: gaushala._id };
    if (branchId) query.assignedBranch = branchId;
    if (availability) query.availabilityStatus = availability;

    const doctors = await Doctor.find(query).populate('assignedBranch', 'name branchId');

    res.status(200).json({
      success: true,
      count: doctors.length,
      doctors
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching doctors' });
  }
};

// @desc Add new doctor
// @route POST /api/doctors
exports.createDoctor = async (req, res) => {
  try {
    const gaushala = await Gaushala.findOne({ owner: req.user._id });
    if (!gaushala) {
      return res.status(404).json({ success: false, message: 'Gaushala not found' });
    }

    const {
      name,
      phone,
      email,
      qualification,
      registrationNumber,
      specialization,
      assignedBranchId,
      workingHours,
      photo
    } = req.body;

    if (!name || !phone || !qualification) {
      return res.status(400).json({
        success: false,
        message: 'Doctor name, phone and qualification are required.'
      });
    }

    let branch = null;
    if (assignedBranchId) {
      branch = await Branch.findOne({ _id: assignedBranchId, gaushala: gaushala._id });
    } else {
      branch = await Branch.findOne({ gaushala: gaushala._id });
    }

    if (!branch) {
      return res.status(400).json({ success: false, message: 'A valid branch must be assigned to the doctor.' });
    }

    const doctor = await Doctor.create({
      gaushala: gaushala._id,
      assignedBranch: branch._id,
      name,
      phone,
      email: email || '',
      qualification,
      registrationNumber: registrationNumber || '',
      specialization: specialization || 'General Veterinary Medicine',
      workingHours: workingHours || '09:00 AM - 06:00 PM',
      photo: photo || '',
      availabilityStatus: 'AVAILABLE',
      isActive: true,
      isVerified: true
    });

    res.status(201).json({
      success: true,
      message: 'Doctor registered successfully',
      doctor
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error registering doctor' });
  }
};

// @desc Update doctor
// @route PUT /api/doctors/:id
exports.updateDoctor = async (req, res) => {
  try {
    const gaushala = await Gaushala.findOne({ owner: req.user._id });
    const doctor = await Doctor.findOne({ _id: req.params.id, gaushala: gaushala._id });

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const {
      name,
      phone,
      email,
      qualification,
      registrationNumber,
      specialization,
      assignedBranchId,
      workingHours,
      availabilityStatus,
      isActive,
      photo
    } = req.body;

    if (name) doctor.name = name;
    if (phone) doctor.phone = phone;
    if (email !== undefined) doctor.email = email;
    if (qualification) doctor.qualification = qualification;
    if (registrationNumber !== undefined) doctor.registrationNumber = registrationNumber;
    if (specialization) doctor.specialization = specialization;
    if (assignedBranchId) doctor.assignedBranch = assignedBranchId;
    if (workingHours) doctor.workingHours = workingHours;
    if (availabilityStatus) doctor.availabilityStatus = availabilityStatus;
    if (typeof isActive === 'boolean') doctor.isActive = isActive;
    if (photo) doctor.photo = photo;

    await doctor.save();

    res.status(200).json({
      success: true,
      message: 'Doctor updated successfully',
      doctor
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating doctor' });
  }
};

// @desc Get appointments for current Gaushala
// @route GET /api/doctors/appointments
exports.getAppointments = async (req, res) => {
  try {
    const gaushala = await Gaushala.findOne({ owner: req.user._id });
    if (!gaushala) {
      return res.status(404).json({ success: false, message: 'Gaushala not found' });
    }

    const appointments = await Appointment.find({ gaushala: gaushala._id })
      .sort({ scheduledDate: -1 })
      .populate('doctor', 'name phone qualification')
      .populate('branch', 'name')
      .populate('medicalRequest');

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching appointments' });
  }
};

