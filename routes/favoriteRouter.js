const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Favorites = require('../models/favorites');
const favoritesRouter = express.Router();
const authenticate = require('./auth');
const cors = require('./cors');

//const Dishes = require('../models/dishes');
favoritesRouter.use(bodyParser.json());

favoritesRouter.route('/')
.options( (req, res) => { res.sendStatus(200); })//cors.corsWithOptions,
.get( authenticate.verifyUser, (req, res, next) => {//cors.cors
    Favorites.findOne({ user: req.user._id})
    .populate('user')
    .populate('dish')//dishes to dish has been changed
    .then((favorites) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    }, (err) => next(err))
    .catch((err) => next(err));
})
/*.exec((err, favorites) => {
        if (err) 
            return next(err);
        if (favorites) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites.favorites);
            }
        else {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json([]);
        }
    });
})*/
    /*Favourites.find({})
        .populate('user')
        .populate('dishes')
        .then((favourites) => {
            // extract favourites that match the req.user.id
            if (favourites) {
                user_favourites = favourites.filter(fav => fav.user._id.toString() === req.user.id.toString())[0];
                if(!user_favourites) {
                    var err = new Error('You have no favourites!');
                    err.status = 404;
                    return next(err);
                }
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(user_favourites);
            } else {
                var err = new Error('There are no favourites');
                err.status = 404;
                return next(err);
            }

        }, (err) => next(err))
        .catch((err) => next(err));
})*/
.post( authenticate.verifyUser, (req, res, next) => {//cors.corsWithOptions,
        Favorites.findOne({user: req.user._id}, (err, favorites) =>{
        if(err)
            return next(err);
        if(!favorites || favorites.length === 0){
            Favorites.create({user:req.user._id})
            .then((favorites) => {
                for(i=0; i<req.body.length; i++){
                    if(favorites.dishes.indexOf(req.body[i]._id) < 0)
                        favorites.dishes.push(req.body[i]);
                    favorites.save()
                    .then((favorites) => {
                        Favorites.findById(favorites._id)
                        .populate('user')
                        .populate('dish')//dishes to dish has been changed
                        .then((favorites) => {
                            res.statusCode = 200;
                            res.setHeader("Content-Type", "application/json");
                            res.json(favorites);
                        })
                    })
                    .catch((err) => {
                        return next(err);
                    });
                }
            })
            .catch((err) =>{
                return next(err);
            });
        }
        else{
            for(i=0; i<req.body.length; i++){
                if(favorites.dishes.indexOf(req.body[i]._id) <0)
                    favorites.dishes.push(req.body[i]);
                favorites.save()
                .then((favorites) => {
                    Favorites.findById(favorites._id)
                    .populate('user')
                    .populate('dish')//changed from dishes to dish
                    .then((favorites) => {
                        res.statusCode = 200;
                        res.setHeader("Content-Type", "application/json");
                        res.json(favorites);
                    })
                    .catch((err) => {
                        return next(err);
                    });
                })
                .catch((err) => {
                    return next(err);
                });
            }
        }
    })
        /*Favourites.findOne()
            .populate('user')
            .populate('dishes')
            .then((favourites) => {
                var user;
                if(favourites)
                    user = favourites.filter(fav => fav.user._id.toString() === req.user.id.toString())[0];
                if(!user)
                    user = new Favourites({user: req.user.id});
                for(let i of req.body){
                    if(user.dishes.find((d_id) => {
                        if(d_id._id){
                            return d_id._id.toString() === i._id.toString();
                        }
                    }))
                        continue;
                    user.dishes.push(i._id);
                }
                user.save()
                    .then((userFavs) => {
                        res.statusCode = 201;
                        res.setHeader("Content-Type", "application/json");
                        res.json(userFavs);
                        console.log("Favourites Created");
                    }, (err) => next(err))
                    .catch((err) => next(err));

            })
            .catch((err) => next(err));
})*/

.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain')
    res.end('PUT operation is not supported on /favourites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    
    favorites.findOneAndRemove({user: req.user._id}, (err,favorites) =>{
        if(err)
            return next(err);
        res.statusCode = 403;
        res.setHeader('Content-Type', 'text/plain')
        res.json(resp)
    });
});

    /*Favourites.find({})
        .populate('user')
        .populate('dishes')
        .then((favourites) => {
            var favToRemove;
            if (favourites) {
                favToRemove = favourites.filter(fav => fav.user._id.toString() === req.user.id.toString())[0];
            }
            if(favToRemove){
                favToRemove.remove()
                    .then((result) => {
                        res.statusCode = 200;
                        res.setHeader("Content-Type", "application/json");
                        res.json(result);
                    }, (err) => next(err));

            } else {
                var err = new Error('You do not have any favourites');
                err.status = 404;
                return next(err);
            }
        }, (err) => next(err))
        .catch((err) => next(err));
});*/

favoriteRouter.route('/:dishId')
.options((req, res) => { res.sendStatus(200); })//cors.corsWithOptions, 
.get(authenticate.verifyUser, (req, res, next) => {//cors.cors, 
    Favorites.findOne({user: req.user._id})
    .then((favorites) => {
        if (!favorites) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.json({"exists": true, "favorites": favorites});
        }
        else {
            if (favorites.dishes.indexOf(req.params.dishId) < 0) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": true, "favorites": favorites});
            }
            else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": true, "favorites": favorites});
            }
        }
    }, (err) => next(err))
    .catch((err) => next(err))
})

    /*Favourites.findOne({})
        .populate('user')
        .populate('dishes')
        .then((favourites) => {
            if (favourites) {
                const favs = favourites.filter(fav => fav.user._id.toString() === req.user.id.toString())[0];
                const dish = favs.dishes.filter(dish => dish.id === req.params.dishId)[0];
                if(dish) {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(dish);
                } else {
                    var err = new Error('You do not have dish ' + req.params.dishId);
                    err.status = 404;
                    return next(err);
                }
            } else {
                var err = new Error('You do not have any favourites');
                err.status = 404;
                return next(err);
            }
        }, (err) => next(err))
        .catch((err) => next(err));
})*/
.post( authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id }, (err, favorites) => {
        if(err) return next(err);

        if(!favorites){
            Favorites.create({user:req.user._id})
            .then((favorites) => {
                favorites.dishes.push({"_id": req.params.dish});
                favorites.save()
                .then((favorites) =>{
                    Favorites.findById(favorites._id)
                    .populate('user')
                    .populate('dish')//changed from dishes to dish
                    .then((favorites) =>{
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorites);
                    })
                })
                .catch((err) => {
                    return next(err);
                });
            })
            .catch((err) => {
                return next(err);

            });
        }
        else{
            if(favorites.dishes.indexOf(req.params.dishId) <0){
                favorites.dishes.push(req.body[i]);
                favorites.save()
                .then((favorites) => {
                    Favorites.findById(favorites._id)
                    .populate('user')
                    .populate('dish')//changed from dishes to dish
                    .then((favorites) => {
                        res.statusCode = 200;
                        res.setHeader("Content-Type", "application/json");
                        res.json(favorites);
                    })
                })
                .catch((err) => {
                    return next(err);
                });
            }
            else {
                res.statusCode = 403;
                res.setHeader("Content-Type", "text/plain");
                res.end('Dish'+req.params.id+'already deleted');
            }
        }
    });
});
})
    /*Favourites.find({})
            .populate('user')
            .populate('dishes')
            .then((favourites) => {
                var user;
                if(favourites)
                    user = favourites.filter(fav => fav.user._id.toString() === req.user.id.toString())[0];
                if(!user)
                    user = new Favourites({user: req.user.id});
                if(!user.dishes.find((d_id) => {
                    if(d_id._id)
                        return d_id._id.toString() === req.params.dishId.toString();
                }))
                    user.dishes.push(req.params.dishId);

                user.save()
                    .then((userFavs) => {
                        res.statusCode = 201;
                        res.setHeader("Content-Type", "application/json");
                        res.json(userFavs);
                        console.log("Favourites Created");
                    }, (err) => next(err))
                    .catch((err) => next(err));

            })
            .catch((err) => next(err));
})*/

.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation is not supported on /favourites/:dishId');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id}, (err, favorites) => {
        if(err) return next(err);

        var index = favorites.dishes.indexOf(req.params.dishId)
        if(index >= 0){
            favorites.dishes.splice(index,1);
            favorites.save()
            .then((favorites) => {
                console.log('Favorite is Deleted!', favorites);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            })
            .catch((err) => {
                return next(err);
            });
        }
        else {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/plain');
            res.end('Dish ' + req.params._id + ' not in your favorites!');
        }
    });
})
    /*Favourites.find({})
        .populate('user')
        .populate('dishes')
        .then((favourites) => {
            var user;
            if(favourites)
                user = favourites.filter(fav => fav.user._id.toString() === req.user.id.toString())[0];
            if(user){
                user.dishes = user.dishes.filter((dishid) => dishid._id.toString() !== req.params.dishId);
                user.save()
                    .then((result) => {
                        res.statusCode = 200;
                        res.setHeader("Content-Type", "application/json");
                        res.json(result);
                    }, (err) => next(err));

            } else {
                var err = new Error('You do not have any favourites');
                err.status = 404;
                return next(err);
            }
        }, (err) => next(err))
        .catch((err) => next(err));
});*/

module.exports = favoritesRouter;
