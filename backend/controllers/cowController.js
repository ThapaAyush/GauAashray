const Cow = require('../models/Cow');
const Gaushala = require('../models/Gaushala');
const Branch = require('../models/Branch');

// @desc Get cows with filters, pagination and tenant isolation
// @route GET /api/cows
exports.getCows = async (req, res) => {
  try {
    const gaushala = await Gaushala.findOne({ owner: req.user._id });
    if (!gaushala) {
      return res.status(404).json({ success: false, message: 'Gaushala not found' });
    }

    const { branchId, healthCondition, search, page = 1, limit = 20 } = req.query;

    const query = { gaushala: gaushala._id };

    if (branchId) query.currentBranch = branchId;
    if (healthCondition && healthCondition !== 'ALL') query.healthCondition = healthCondition;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { cowId: { $regex: search, $options: 'i' } },
        { tagNumber: { $regex: search, $options: 'i' } },
        { breed: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Cow.countDocuments(query);
    const cows = await Cow.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('currentBranch', 'name branchId');

    res.status(200).json({
      success: true,
      count: cows.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      cows
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching cows' });
  }
};

// @desc Get single cow profile
// @route GET /api/cows/:id
exports.getCowById = async (req, res) => {
  try {
    const gaushala = await Gaushala.findOne({ owner: req.user._id });
    const cow = await Cow.findOne({ _id: req.params.id, gaushala: gaushala._id })
      .populate('currentBranch')
      .populate('gaushala', 'name');

    if (!cow) {
      return res.status(404).json({ success: false, message: 'Cow record not found' });
    }

    res.status(200).json({ success: true, cow });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching cow details' });
  }
};

// @desc Add new cow
// @route POST /api/cows
exports.createCow = async (req, res) => {
  try {
    const gaushala = await Gaushala.findOne({ owner: req.user._id });
    if (!gaushala) {
      return res.status(404).json({ success: false, message: 'Gaushala not found' });
    }

    const {
      name,
      breed,
      gender,
      ageYears,
      source,
      healthCondition,
      branchId,
      tagNumber,
      notes,
      photographs
    } = req.body;

    // Check branch
    let branch = null;
    if (branchId) {
      branch = await Branch.findOne({ _id: branchId, gaushala: gaushala._id });
    } else {
      branch = await Branch.findOne({ gaushala: gaushala._id });
    }

    if (!branch) {
      return res.status(400).json({ success: false, message: 'A valid branch must be assigned.' });
    }

    const cowId = await Cow.generateUniqueId();

    let photos = [];
    if (Array.isArray(photographs)) photos = photographs;
    else if (photographs) photos = [photographs];

    const cow = await Cow.create({
      cowId,
      name: name || 'Unnamed Cow',
      breed: breed || 'Desi / Indigenous',
      gender: gender || 'COW',
      ageYears: ageYears ? parseFloat(ageYears) : null,
      source: source || 'DONATED',
      healthCondition: healthCondition || 'HEALTHY',
      photographs: photos,
      gaushala: gaushala._id,
      currentBranch: branch._id,
      tagNumber: tagNumber || '',
      notes: notes || ''
    });

    // Update branch cow counts
    await Branch.findByIdAndUpdate(branch._id, { $inc: { currentCows: 1 } });
    await Gaushala.findByIdAndUpdate(gaushala._id, { $inc: { currentCows: 1 } });

    res.status(201).json({
      success: true,
      message: 'Cow registered successfully',
      cow
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error creating cow record' });
  }
};

// @desc Update cow details
// @route PUT /api/cows/:id
exports.updateCow = async (req, res) => {
  try {
    const gaushala = await Gaushala.findOne({ owner: req.user._id });
    const cow = await Cow.findOne({ _id: req.params.id, gaushala: gaushala._id });

    if (!cow) {
      return res.status(404).json({ success: false, message: 'Cow not found' });
    }

    const {
      name,
      breed,
      gender,
      ageYears,
      healthCondition,
      tagNumber,
      notes,
      photographs,
      vaccination
    } = req.body;

    if (name) cow.name = name;
    if (breed) cow.breed = breed;
    if (gender) cow.gender = gender;
    if (ageYears !== undefined) cow.ageYears = ageYears;
    if (healthCondition) cow.healthCondition = healthCondition;
    if (tagNumber !== undefined) cow.tagNumber = tagNumber;
    if (notes !== undefined) cow.notes = notes;
    if (photographs) cow.photographs = photographs;

    if (vaccination && vaccination.vaccineName) {
      cow.vaccinationDetails.push({
        vaccineName: vaccination.vaccineName,
        dateAdministered: vaccination.dateAdministered || new Date(),
        nextDueDate: vaccination.nextDueDate || null,
        doctorName: vaccination.doctorName || ''
      });
    }

    await cow.save();

    res.status(200).json({
      success: true,
      message: 'Cow updated successfully',
      cow
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating cow' });
  }
};

// @desc Transfer cow between branches
// @route PUT /api/cows/:id/transfer
exports.transferCowBranch = async (req, res) => {
  try {
    const { targetBranchId, reason } = req.body;
    const gaushala = await Gaushala.findOne({ owner: req.user._id });

    const cow = await Cow.findOne({ _id: req.params.id, gaushala: gaushala._id });
    if (!cow) {
      return res.status(404).json({ success: false, message: 'Cow not found' });
    }

    const targetBranch = await Branch.findOne({ _id: targetBranchId, gaushala: gaushala._id });
    if (!targetBranch) {
      return res.status(400).json({ success: false, message: 'Target branch is invalid.' });
    }

    const oldBranchId = cow.currentBranch;
    cow.currentBranch = targetBranch._id;
    cow.notes += `\n[${new Date().toLocaleDateString()}] Transferred to branch ${targetBranch.name}. Reason: ${reason || 'Capacity balancing'}`;
    await cow.save();

    // Adjust counts
    if (oldBranchId) {
      await Branch.findByIdAndUpdate(oldBranchId, { $inc: { currentCows: -1 } });
    }
    await Branch.findByIdAndUpdate(targetBranch._id, { $inc: { currentCows: 1 } });

    res.status(200).json({
      success: true,
      message: `Cow transferred to ${targetBranch.name} successfully.`,
      cow
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error transferring cow' });
  }
};

// @desc Mark cow deceased
// @route PUT /api/cows/:id/deceased
exports.markCowDeceased = async (req, res) => {
  try {
    const { deceasedDate, deceasedReason } = req.body;
    const gaushala = await Gaushala.findOne({ owner: req.user._id });

    const cow = await Cow.findOne({ _id: req.params.id, gaushala: gaushala._id });
    if (!cow) {
      return res.status(404).json({ success: false, message: 'Cow not found' });
    }

    cow.healthCondition = 'DECEASED';
    cow.deceasedDate = deceasedDate ? new Date(deceasedDate) : new Date();
    cow.deceasedReason = deceasedReason || 'Natural causes / age';
    await cow.save();

    // Decrement active counts
    if (cow.currentBranch) {
      await Branch.findByIdAndUpdate(cow.currentBranch, { $inc: { currentCows: -1 } });
    }
    await Gaushala.findByIdAndUpdate(gaushala._id, { $inc: { currentCows: -1 } });

    res.status(200).json({
      success: true,
      message: 'Deceased record marked with dignity.',
      cow
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating record' });
  }
};

