exports.validateFields = (requiredFields, req, res) => {
  for (const field of requiredFields) {
    if (!req.body[field.name] || req.body[field.name] === "") {
      return res.status(400).json({ success: false, message: field.message });
    }
  }
};
