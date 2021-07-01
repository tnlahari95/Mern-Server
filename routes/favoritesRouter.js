const express = require("express");
const favoritesRouter = express.Router();
//const authenticate = require("../authenticate");
const authenticate = require('./auth');
const cors = require("./cors");
const Favorites = require("../models/favorites");
const Dishes = require("../models/dishes");

favoritesRouter.route("/")
  .options(cors.corsWithOptions, (req, res) => {res.sendStatus(200);})
  .get(cors.cors, authenticate.verifyUser, 
    async (req, res, next) => {
      try {
        const userFavs = await Favorites.findOne({ user: req.user._id })
          .populate("user")
          .populate("dish");
        res.status(200).json(userFavs);
      } 
      catch (err) {
        next(err);
      }
    }
  )
  .post(cors.corsWithOptions, authenticate.verifyUser,
    async (req, res, next) => {
      try {
        // Check if all dishes on req.body exists
        for (let i = 0; i < req.body.length; i++) {
          findDishes = await Dishes.findOne({ _id: req.body[i]._id });
          if (findDishes === null) {
            res.status(400);
            throw new Error(`Bad Request`);
          }
        }
        foundFav = await Favorites.findOne({ user: req.user._id });
        if (foundFav === null) {
          await Favorites.create({ user: req.user._id });
        }
        for (let i = 0; i < req.body.length; i++) {
          await Favorites.findOneAndUpdate(
            { user: req.user._id },
            { $addToSet: { dishes: req.body[i]._id } }, // Doesn't add dish if already exists
            { new: true }
          );
        }
        newFav = await Favorites.findOne({ user: req.user._id });
        res.status(200).json(newFav);
      } catch (err) {
        next(err);
      }
    }
  )
  .put((req, res, next) => {
    res.statusCode = 403;
    res.end(`PUT request not supported for ${req.originalUrl}`);
  })
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    async (req, res, next) => {
      try {
        foundFav = await Favorites.findOneAndDelete({ user: req.user._id });
        res.status(200).json({ sucess: true, foundFav });
      } catch (err) {
        next(err);
      }
    }
  );

favoritesRouter
  .route("/:dishId")
  .get((req, res, next) => {
    res.statusCode = 403;
    res.end(`GET request not supported for ${req.originalUrl}`);
  })
  .post(
    cors.corsWithOptions,
    authenticate.verifyUser,
    async (req, res, next) => {
      try {
        foundDish = await Dishes.findById(req.params.dishid); // Check to see if dish exists
        if (foundDish) {
          foundFav = await Favorites.findOne({ user: req.user._id });
          if (foundFav === null) {
            const newFav = await Favorites.create({
              user: req.user._id,
              dishes: req.params.dishid,
            });
            res.status(200).json(newFav);
          } else {
            const updateFav = await Favorites.findOneAndUpdate(
              { user: req.user._id },
              { $addToSet: { dishes: req.params.dishid } },
              { new: true }
            );
            res.status(200).json(updateFav);
          }
        } else {
          res.statusCode = 404;
          throw new Error(`Dish ${req.params.dishid} not found`);
        }
      } catch (err) {
        next(err);
      }
    }
  )
  .put((req, res, next) => {
    res.statusCode = 403;
    res.end(`PUT request not supported for ${req.originalUrl}`);
  })
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    async (req, res, next) => {
      try {
        foundDish = await Dishes.findById(req.params.dishid);
        if (foundDish) {
          foundFav = await Favorites.findOne({ user: req.user._id });
          if (foundFav === null) {
            res.status(404).end(`User favorites not found`);
          } else if (foundFav.dishes.indexOf(req.params.dishid) != -1) {
            const deletedDish = await Favorites.findOneAndUpdate(
              { user: req.user._id },
              { $pull: { dishes: req.params.dishid } }, // Removes dish if it exists
              { new: true }
            );
            res.status(200).json(deletedDish);
          } else {
            res.statusCode = 404;
            throw new Error(`Dish ${req.params.dishid} not found in favorites`);
          }
        } else {
          res.statusCode = 404;
          throw new Error(`Dish ${req.params.dishid} not found`);
        }
      } catch (err) {
        next(err);
      }
    }
  );

module.exports = favoritesRouter;