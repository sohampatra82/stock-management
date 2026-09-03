const Material = require('../models/Material');
const { isValidObjectId, sanitizeString, parseQuantity } = require('../utils/helpers');

const listMaterials = async (req, res) => {
  try {
    const { search, category, location, status, sort } = req.query;
    const query = {};

    if (search) {
      const s = sanitizeString(search);
      query.$or = [
        { name: { $regex: s, $options: 'i' } },
        { code: { $regex: s, $options: 'i' } },
        { category: { $regex: s, $options: 'i' } },
        { location: { $regex: s, $options: 'i' } }
      ];
    }

    if (category) {
      query.category = { $regex: sanitizeString(category), $options: 'i' };
    }
    if (location) {
      query.location = { $regex: sanitizeString(location), $options: 'i' };
    }

    let materials = await Material.find(query).sort(
      sort === 'name' ? { name: 1 } :
      sort === 'code' ? { code: 1 } :
      sort === 'quantity' ? { quantity: 1 } :
      sort === 'quantity_desc' ? { quantity: -1 } :
      { createdAt: -1 }
    );

    if (status === 'low') {
      materials = materials.filter((m) => m.quantity > 0 && m.quantity <= m.minimumStock);
    } else if (status === 'out') {
      materials = materials.filter((m) => m.quantity <= 0);
    } else if (status === 'available') {
      materials = materials.filter((m) => m.quantity > m.minimumStock);
    }

    const categories = await Material.distinct('category');
    const locations = await Material.distinct('location');

    res.render('materials/index', {
      title: 'Materials',
      materials,
      categories,
      locations,
      filters: { search: search || '', category: category || '', location: location || '', status: status || '', sort: sort || '' },
      success: req.query.success || null,
      error: req.query.error || null
    });
  } catch (error) {
    console.error('List materials error:', error);
    res.render('materials/index', {
      title: 'Materials',
      materials: [],
      categories: [],
      locations: [],
      filters: {},
      success: null,
      error: 'Unable to load materials.'
    });
  }
};

const getAddMaterial = (req, res) => {
  res.render('materials/add', {
    title: 'Add Material',
    material: {},
    error: null
  });
};

const postAddMaterial = async (req, res) => {
  try {
    const name = sanitizeString(req.body.name || '');
    const code = sanitizeString(req.body.code || '').toUpperCase();
    const category = sanitizeString(req.body.category || '');
    const description = sanitizeString(req.body.description || '');
    const unit = sanitizeString(req.body.unit || '');
    const quantity = parseQuantity(req.body.quantity);
    const minimumStock = parseQuantity(req.body.minimumStock);
    const location = sanitizeString(req.body.location || '');
    const supplierName = sanitizeString(req.body.supplierName || '');
    const supplierContact = sanitizeString(req.body.supplierContact || '');

    if (!name || !code || !category || !unit) {
      return res.render('materials/add', {
        title: 'Add Material',
        material: req.body,
        error: 'Name, Code, Category and Unit are required.'
      });
    }

    if (quantity === null || minimumStock === null) {
      return res.render('materials/add', {
        title: 'Add Material',
        material: req.body,
        error: 'Please enter valid quantities.'
      });
    }

    const existing = await Material.findOne({ code });
    if (existing) {
      return res.render('materials/add', {
        title: 'Add Material',
        material: req.body,
        error: 'Material code already exists. Please use a unique code.'
      });
    }

    await Material.create({
      name,
      code,
      category,
      description,
      unit,
      quantity,
      minimumStock,
      location,
      supplierName,
      supplierContact
    });

    res.redirect('/materials?success=Material added successfully.');
  } catch (error) {
    console.error('Add material error:', error);
    res.render('materials/add', {
      title: 'Add Material',
      material: req.body,
      error: 'Unable to add material. Please try again.'
    });
  }
};

const getEditMaterial = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.redirect('/materials?error=Material not found.');
    }
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.redirect('/materials?error=Material not found.');
    }
    res.render('materials/edit', {
      title: 'Edit Material',
      material,
      error: null
    });
  } catch (error) {
    console.error('Edit material get error:', error);
    res.redirect('/materials?error=Unable to load material.');
  }
};

const postEditMaterial = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.redirect('/materials?error=Material not found.');
    }

    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.redirect('/materials?error=Material not found.');
    }

    const name = sanitizeString(req.body.name || '');
    const code = sanitizeString(req.body.code || '').toUpperCase();
    const category = sanitizeString(req.body.category || '');
    const description = sanitizeString(req.body.description || '');
    const unit = sanitizeString(req.body.unit || '');
    const minimumStock = parseQuantity(req.body.minimumStock);
    const location = sanitizeString(req.body.location || '');
    const supplierName = sanitizeString(req.body.supplierName || '');
    const supplierContact = sanitizeString(req.body.supplierContact || '');

    if (!name || !code || !category || !unit) {
      return res.render('materials/edit', {
        title: 'Edit Material',
        material: { ...material.toObject(), ...req.body },
        error: 'Name, Code, Category and Unit are required.'
      });
    }

    if (minimumStock === null) {
      return res.render('materials/edit', {
        title: 'Edit Material',
        material: { ...material.toObject(), ...req.body },
        error: 'Please enter a valid minimum stock level.'
      });
    }

    if (code !== material.code) {
      const existing = await Material.findOne({ code });
      if (existing) {
        return res.render('materials/edit', {
          title: 'Edit Material',
          material: { ...material.toObject(), ...req.body },
          error: 'Material code already exists.'
        });
      }
    }

    material.name = name;
    material.code = code;
    material.category = category;
    material.description = description;
    material.unit = unit;
    material.minimumStock = minimumStock;
    material.location = location;
    material.supplierName = supplierName;
    material.supplierContact = supplierContact;

    await material.save();
    res.redirect('/materials?success=Material updated successfully.');
  } catch (error) {
    console.error('Edit material error:', error);
    res.redirect('/materials?error=Unable to update material.');
  }
};

const getViewMaterial = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.redirect('/materials?error=Material not found.');
    }
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.redirect('/materials?error=Material not found.');
    }
    res.render('materials/view', {
      title: 'View Material',
      material
    });
  } catch (error) {
    console.error('View material error:', error);
    res.redirect('/materials?error=Unable to load material.');
  }
};

const deleteMaterial = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.redirect('/materials?error=Material not found.');
    }
    const material = await Material.findByIdAndDelete(req.params.id);
    if (!material) {
      return res.redirect('/materials?error=Material not found.');
    }
    res.redirect('/materials?success=Material deleted successfully.');
  } catch (error) {
    console.error('Delete material error:', error);
    res.redirect('/materials?error=Unable to delete material.');
  }
};

module.exports = {
  listMaterials,
  getAddMaterial,
  postAddMaterial,
  getEditMaterial,
  postEditMaterial,
  getViewMaterial,
  deleteMaterial
};
