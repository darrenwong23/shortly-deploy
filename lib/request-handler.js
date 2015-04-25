//==
var Q = require('q');   //added in mongoose transfer
//==
var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');


var db = require('../app/config');
var User = require('../app/models/user');
var Link = require('../app/models/link');
var Users = require('../app/collections/users');
var Links = require('../app/collections/links');

exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function(){
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  //ADD MONGOOSE  (fetch all links)
  var findAll = Q.nbind(Link.find, Link)

  findAll({})
    .then(function(links){
      console.log(links);
      res.json(links);
    })
    .fail(function(error){
      next(error);
    });
  // Links.reset().fetch().then(function(links) {
  //   res.send(200, links.models);
  // })
};

exports.saveLink = function(req, res) {

  var url = req.body.url;
  console.log(req.body);
  if (!util.isValidUrl(url)) {
    //REMOVE IF OUT CODE BREAKS
    return next(new Error('Not a valid url'));
  }

  var createLink = Q.nbind(Link.create, Link);
  var findLink = Q.nbind(Link.findOne, Link);

  findLink({url: url})
    .then(function (match) {
      if (match) {
        res.send(match);
      } else {
        return  util.getUrlTitle(url);
      }
    })
    .then(function (title) {
      if (title) {
        var newLink = {
          url: url,
          visits: 0,
          base_url: req.headers.origin,
          title: title
        };
        console.log(newLink);
        return createLink(newLink);
      }
    })
    .then(function (createdLink) {
      if (createdLink) {
        res.json(createdLink);
      }
    })
    .fail(function (error) {
      next(error);
    });
  // var uri = req.body.url;

  // if (!util.isValidUrl(uri)) {
  //   console.log('Not a valid url: ', uri);
  //   return res.send(404);
  // }

  // //ADD MONGOOSE  (check whether link in server)
  // new Link({ url: uri }).fetch().then(function(found) {
  //   if (found) {
  //     res.send(200, found.attributes);
  //   } else {
  //     util.getUrlTitle(uri, function(err, title) {
  //       if (err) {
  //         console.log('Error reading URL heading: ', err);
  //         return res.send(404);
  //       }

  //       var link = new Link({
  //         url: uri,
  //         title: title,
  //         base_url: req.headers.origin
  //       });

  //       //ADD MONGOOSE  (add link to server)
  //       link.save().then(function(newLink) {
  //         Links.add(newLink);
  //         res.send(200, newLink);
  //       });
  //     });
  //   }
  // });
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  var findUser = Q.nbind(User.findOne, User);
  findUser({username: username})
    .then(function (user) {
      if (!user) {

      } else {
        return user.comparePasswords(password)
          .then(function(foundUser) {
            if (foundUser) {
              util.createSession(req,res,user);
            } else {
              return next(new Error('No user'));
            }
          });
      }
    })
    .fail(function (error) {
      next(error);
    });



  //ADD MONGOOSE  (check whether user exists)
  // new User({ username: username })
  //   .fetch()
  //   .then(function(user) {
  //     if (!user) {
  //       res.redirect('/login');
  //     } else {
  //       user.comparePassword(password, function(match) {
  //         if (match) {
  //           util.createSession(req, res, user);
  //         } else {
  //           res.redirect('/login');
  //         }
  //       })
  //     }
  // });
};

exports.signupUser = function(req, res) {
  var username  = req.body.username,
      password  = req.body.password,
      create,
      newUser;

  var findOne = Q.nbind(User.findOne, User);
  console.log("IM HERE");
  //check to see if user already exists
  findOne({username: username})
    .then(function(user) {
      console.log(user, "awlejtraewr")
      if (user) {
        console.log("IM existing")
        next(new Error('User already exist!'));
      } else {
        // make a new user if not one
        //
        create = Q.nbind(User.create, User);
        newUser = {
          username: username,
          password: password
        };
        console.log(newUser, "Im a new user")
        return create(newUser);
      }
    })
    .then(function (user) {
      // create token to send back for auth
      util.createSession(req,res,user);
    })
    .fail(function (error) {
      next(error);
    });


  // var username = req.body.username;
  // var password = req.body.password;

  // //ADD MONGOOSE  (check whether user exists)

  // new User({ username: username })
  //   .fetch()
  //   .then(function(user) {
  //     if (!user) {
  //       var newUser = new User({
  //         username: username,
  //         password: password
  //       });

  //         //ADD MONGOOSE  (add user to server)

  //       newUser.save()
  //         .then(function(newUser) {
  //           util.createSession(req, res, newUser);
  //           Users.add(newUser);
  //         });
  //     } else {
  //       console.log('Account already exists');
  //       res.redirect('/signup');
  //     }
  //   })
};

exports.navToLink = function(req, res) {
    // var link = req.navLink;
    // link.visits++;
    // link.save(function (err, savedLink) {
    //   if (err) {
    //     next(err);
    //   } else {
    //     res.redirect(savedLink.url);
    //   }
    // });




  var url = req.params[0];
  var findLink = Q.nbind(Link.findOne, Link);
  console.log(url, " im a url")
  findLink({code: url})
    .then(function (match) {
      console.log(match, " I am the match")
      if (match) {
        match.visits++;
        match.save(function (err, savedLink) {
          if (err) {
            next(err);
          } else {
            res.redirect(savedLink.url);
          }
        });
      } else {
        console.log ("IM BROKE $(");
      };
      });

  //   //ADD MONGOOSE  (finds link and sends us to the u r l )

  // new Link({ code: req.params[0] }).fetch().then(function(link) {
  //   if (!link) {
  //     res.redirect('/');
  //   } else {
  //     link.set({ visits: link.get('visits') + 1 })
  //       .save()
  //       .then(function() {
  //         return res.redirect(link.get('url'));
  //       });
  //   }
  // });
}
