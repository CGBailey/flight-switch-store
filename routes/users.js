var express = require('express');
var router = express.Router();
var bookshelf = require('../db/config.js');

function isUser(req, res, next) {
  var user_id = req.session.id;
  if (user_id) {
    next();
  } else {
    res.redirect(401, '/');
  }
};

function authenticUser(req, res, next) {
var user_id = req.session.id;
  if(user_id == req.params.id) {
    next();
  }else{
    res.redirect(401, '/');
  }
};


router.get('/:id', isUser, authenticUser, function(req, res, next){
  bookshelf.User.where({id: req.params.id}).fetch({withRelated: ['orders']})
  .then(function(user) {
    res.render('./user/account', {orders: user.orders})
  })
});

router.get('/:id/info', isUser, authenticUser, function(req, res, next){
  bookshelf.knex('users').where({id: req.params.id})
  .then(function(user) {
    res.render('./user/account', {user: user})
  })
});

router.get('/:id/edit', function(req, res, next){
  bookshelf.knex('users').where({id: req.params.id})
  .then(function(user) {
    res.render('./user/account', {user: user})
  })
})

router.post('/:id/edit', function(req, res, next){
  if(req.body.password){
    bookshelf.User.where({id: req.params.id}).fetch().then(function(user){
      if( user && bcrypt.compareSync(req.body.password, user.password)){
        if( req.body.newpassword === req.body.verifypassword) {
          var hash = bcrypt.hashSync(req.body.newpassword, 8);
          user.set({password: hash}).save();
          res.redirect("/users/" +req.params.id)
        }
        else {
          res.redirect("/users/" + req.params.id +"edit")
        }
      }
      else {
        res.redirect("/users/" + req.params.id +"edit");
      }
  }
    else {
      bookshelf.User.where({id: req.params.id}).fetch().then(function(user){
        user.set({fname: req.body.fname, lname: req.params.lname, email: req.body.email}).save();
        res.redirect("/users/" +req.params.id);
      }
    }
});
});

router.post('/:id/delete', isUser, authenticUser, function(req, res, next){
  bookshelf.User.where({id:req.params.id}).destroy();
    res.redirect('/');
})

module.exports = router;
