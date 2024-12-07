// uses index.pug

const controller = (req, res) => {
  res.status(200).render("main/mainindex", { activePage: "dashboard" });
};

module.exports = controller;
