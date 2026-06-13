import Department from '../models/Department.js';
import Doctor from '../models/Doctor.js';

/**
 * @desc    Get all departments
 * @route   GET /api/departments
 * @access  Public
 */
export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find({});
    return res.json(departments);
  } catch (error) {
    console.error('Get Departments Error:', error);
    return res.status(500).json({ message: 'Failed to retrieve departments' });
  }
};

/**
 * @desc    Create a new department
 * @route   POST /api/departments
 * @access  Private/Admin
 */
export const createDepartment = async (req, res) => {
  const { name, description, icon } = req.body;

  try {
    const deptExists = await Department.findOne({ name });
    if (deptExists) {
      return res.status(400).json({ message: 'Department already exists' });
    }

    const department = await Department.create({
      name,
      description,
      icon,
    });

    return res.status(201).json(department);
  } catch (error) {
    console.error('Create Department Error:', error);
    return res.status(500).json({ message: 'Failed to create department' });
  }
};

/**
 * @desc    Update a department
 * @route   PUT /api/departments/:id
 * @access  Private/Admin
 */
export const updateDepartment = async (req, res) => {
  const { name, description, icon } = req.body;

  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    department.name = name || department.name;
    department.description = description || department.description;
    department.icon = icon || department.icon;

    const updatedDept = await department.save();
    return res.json(updatedDept);
  } catch (error) {
    console.error('Update Department Error:', error);
    return res.status(500).json({ message: 'Failed to update department' });
  }
};

/**
 * @desc    Delete a department
 * @route   DELETE /api/departments/:id
 * @access  Private/Admin
 */
export const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    // Check if there are doctors linked to this department
    const doctorCount = await Doctor.countDocuments({ department: req.params.id });
    if (doctorCount > 0) {
      return res.status(400).json({
        message: 'Cannot delete department. There are doctors assigned to it.',
      });
    }

    await Department.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Department removed successfully' });
  } catch (error) {
    console.error('Delete Department Error:', error);
    return res.status(500).json({ message: 'Failed to delete department' });
  }
};
