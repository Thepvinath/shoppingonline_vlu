const express = require('express');
const router = express.Router();

// utils
const JwtUtil = require('../utils/JwtUtil');
const EmailUtil = require('../utils/EmailUtil'); // ✅ thêm

// daos
const AdminDAO = require('../models/AdminDAO');
const CategoryDAO = require('../models/CategoryDAO');
const ProductDAO = require('../models/ProductDAO');
const OrderDAO = require('../models/OrderDAO');
const CustomerDAO = require('../models/CustomerDAO');

// =====================
// LOGIN
// =====================
router.post('/login', async function (req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.json({
      success: false,
      message: 'Please input username and password'
    });
  }

  const admin = await AdminDAO.selectByUsernameAndPassword(username, password);

  if (!admin) {
    return res.json({
      success: false,
      message: 'Incorrect username or password'
    });
  }

  const token = JwtUtil.genToken();
  res.json({
    success: true,
    message: 'Authentication successful',
    token: token
  });
});

// =====================
// CHECK TOKEN
// =====================
router.get('/token', JwtUtil.checkToken, function (req, res) {
  const token =
    req.headers['x-access-token'] ||
    req.headers['authorization'];

  res.json({
    success: true,
    message: 'Token is valid',
    token: token
  });
});

// =====================
// CATEGORY - GET ALL
// =====================
router.get('/categories', JwtUtil.checkToken, async function (req, res) {
  const categories = await CategoryDAO.selectAll();
  res.json(categories);
});

// =====================
// CATEGORY - INSERT
// =====================
router.post('/categories', JwtUtil.checkToken, async function (req, res) {
  const { name } = req.body;

  if (!name) {
    return res.json({
      success: false,
      message: 'Category name is required'
    });
  }

  const category = { name };
  const result = await CategoryDAO.insert(category);

  res.json({
    success: true,
    category: result
  });
});

// =====================
// CATEGORY - UPDATE
// =====================
router.put('/categories/:id', JwtUtil.checkToken, async function (req, res) {
  const _id = req.params.id;
  const { name } = req.body;

  if (!name) {
    return res.json({
      success: false,
      message: 'Category name is required'
    });
  }

  const category = { _id, name };
  const result = await CategoryDAO.update(category);

  res.json({
    success: true,
    category: result
  });
});

// =====================
// CATEGORY - DELETE
// =====================
router.delete('/categories/:id', JwtUtil.checkToken, async function (req, res) {
  const _id = req.params.id;
  const result = await CategoryDAO.delete(_id);
  res.json(result);
});

// =====================
// PRODUCT - GET (PAGINATION)
// =====================
router.get('/products', JwtUtil.checkToken, async function (req, res) {
  const noProducts = await ProductDAO.selectByCount();
  const sizePage = 4;
  const noPages = Math.ceil(noProducts / sizePage);

  let curPage = 1;
  if (req.query.page) {
    curPage = parseInt(req.query.page);
  }

  const skip = (curPage - 1) * sizePage;
  const products = await ProductDAO.selectBySkipLimit(skip, sizePage);

  const result = {
    products: products,
    noPages: noPages,
    curPage: curPage
  };

  res.json(result);
});

// =====================
// PRODUCT - INSERT
// =====================
router.post('/products', JwtUtil.checkToken, async function (req, res) {
  const name = req.body.name;
  const price = req.body.price;
  const cid = req.body.category;
  const image = req.body.image;
  const now = new Date().getTime();

  const category = await CategoryDAO.selectByID(cid);

  const product = {
    name: name,
    price: price,
    image: image,
    cdate: now,
    category: category
  };

  const result = await ProductDAO.insert(product);
  res.json(result);
});

// =====================
// PRODUCT - UPDATE
// =====================
router.put('/products/:id', JwtUtil.checkToken, async function (req, res) {
  const _id = req.body.id;
  const name = req.body.name;
  const price = req.body.price;
  const cid = req.body.category;
  const image = req.body.image;
  const now = new Date().getTime();

  const category = await CategoryDAO.selectByID(cid);

  const product = {
    _id: _id,
    name: name,
    price: price,
    image: image,
    cdate: now,
    category: category
  };

  const result = await ProductDAO.update(product);
  res.json(result);
});

// =====================
// PRODUCT - DELETE
// =====================
router.delete('/products/:id', JwtUtil.checkToken, async function (req, res) {
  const _id = req.params.id;
  const result = await ProductDAO.delete(_id);
  res.json(result);
});

// =====================
// CUSTOMER - GET ALL
// =====================
router.get('/customers', JwtUtil.checkToken, async function (req, res) {
  const customers = await CustomerDAO.selectAll();
  res.json(customers);
});

// =====================
// CUSTOMER - DEACTIVE (✅ thêm)
// =====================
router.put('/customers/deactive/:id', JwtUtil.checkToken, async function (req, res) {
  const _id = req.params.id;
  const token = req.body.token;
  const result = await CustomerDAO.active(_id, token, 0);
  res.json(result);
});

// =====================
// ORDER - GET ALL
// =====================
router.get('/orders', JwtUtil.checkToken, async function (req, res) {
  const orders = await OrderDAO.selectAll();
  res.json(orders);
});

// =====================
// ORDER - GET BY CUSTOMER
// =====================
router.get('/orders/customer/:cid', JwtUtil.checkToken, async function (req, res) {
  const _cid = req.params.cid;
  const orders = await OrderDAO.selectByCustID(_cid);
  res.json(orders);
});

// ✅ SEND MAIL (thêm mới)
router.get('/customers/sendmail/:id', JwtUtil.checkToken, async function (req, res) {
  const _id = req.params.id;
  const cust = await CustomerDAO.selectByID(_id);

  if (cust) {
    const send = await EmailUtil.send(cust.email, cust._id, cust.token);

    if (send) {
      res.json({ success: true, message: 'Please check email' });
    } else {
      res.json({ success: false, message: 'Email failure' });
    }
  } else {
    res.json({ success: false, message: 'Not exists customer' });
  }
});

// =====================
// ORDER - UPDATE STATUS
// =====================
router.put('/orders/status/:id', JwtUtil.checkToken, async function (req, res) {
  const _id = req.params.id;
  const newStatus = req.body.status;
  const result = await OrderDAO.update(_id, newStatus);
  res.json(result);
});

module.exports = router;