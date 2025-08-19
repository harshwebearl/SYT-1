const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const reviewSchema = require("../models/reviewSchema");
const BaseController = require("./BaseController");
const customerSchema = require("../models/customerSchema");
const Bidschema = require("../models/bidSchema");
const book_package = require("../models/bookpackageschema");
const mongoose = require("mongoose");
const adminSchema = require("../models/AdminSchema");
const agencySchema = require("../models/Agency_personalSchema");
const userSchema = require("../models/usersSchema");
const Notificationschema = require("../models/NotificationSchema");
const packageSchema = require("../models/PackageSchema");
const { getReceiverSocketId, io } = require("../socket/socket");

module.exports = class reviewController extends BaseController {
  async Addreview(req, res) {
    try {
      // const tokenData = req.userData;
      // const adminData = await userSchema({ _id: tokenData.id });

      // if (adminData.length === 0) {
      //   throw new Forbidden("you are not user");
      // }
      const tokenData = req.userData;
      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });
      if (userData[0].role !== "customer") {
        throw new Forbidden("you are not customer");
      }

      let user = await customerSchema.findOne({ user_id: tokenData.id });

      const data = {
        user_id: tokenData.id,
        star: req.body.star,
        book_package_id: req.body.book_package_id,
        comment_box: req.body.comment_box
      };

      const userReview = await reviewSchema.find({
        user_id: tokenData.id,
        book_package_id: req.body.book_package_id
      });
      if (userReview.length !== 0) {
        // console.log(userReview);
        throw new Forbidden("You have already one review on this package");
      }

      const Addreview = new reviewSchema(data);
      const insertreview = await Addreview.save();

      let booking = await book_package.findOne({ _id: req.body.book_package_id });
      let agencyId = null;

      if (booking.bid_package_id) {
        let bid = await Bidschema.findOne({ _id: booking.bid_package_id });
        agencyId = bid?.agency_id;

        const notificationData = await Notificationschema.create({
          user_id: agencyId,
          title: "New Review Received!",
          text: `You have received a new review for your package from ${user.name}. Rating: ${req.body.star} stars.`,
          user_type: "agency"
        });

        const agencySocketId = getReceiverSocketId(agencyId);
        if (agencySocketId) {
          io.to(agencySocketId).emit("newNotification", notificationData);
        }
      } else if (booking.package_id) {
        let packageData = await packageSchema.findOne({ _id: booking.package_id });
        agencyId = packageData?.user_id;
        let agencyInfo = await agencySchema.findOne({ user_id: packageData?.user_id });

        if (agencyInfo) {
          const notificationData = await Notificationschema.create({
            user_id: agencyId,
            title: "New Review Received!",
            text: `You have received a new review for your package from ${user.name}. Rating: ${req.body.star} stars.`,
            user_type: "agency"
          });

          const agencySocketId = getReceiverSocketId(agencyId);
          if (agencySocketId) {
            io.to(agencySocketId).emit("newNotification", notificationData);
          }
        } else {
          const notificationData = await Notificationschema.create({
            user_id: agencyId,
            title: "New Review Received!",
            text: `You have received a new review for your package from ${user.name}. Rating: ${req.body.star} stars.`,
            user_type: "admin"
          });

          const agencySocketId = getReceiverSocketId(agencyId);
          if (agencySocketId) {
            io.to(agencySocketId).emit("newNotification", notificationData);
          }
        }
      }

      return this.sendJSONResponse(
        res,
        "data added",
        {
          length: 1
        },
        insertreview
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  // async Display_review(req, res) {
  //   try {
  //     const _id = req.query._id;
  //     const Display_review = await agencySchema.aggregate([
  //       {
  //         $match: { _id: mongoose.Types.ObjectId(_id) }
  //       },
  //       {
  //         $lookup: {
  //           from: "bids",
  //           localField: "_id",
  //           foreignField: "agency_id",
  //           as: "bid",
  //           pipeline: [
  //             {
  //               $lookup: {
  //                 from: "book_packages",
  //                 localField: "_id",
  //                 foreignField: "bid_package_id",
  //                 as: "book_package",
  //                 pipeline: [
  //                   {
  //                     $lookup: {
  //                       from: "reviews",
  //                       localField: "_id",
  //                       foreignField: "book_package_id",
  //                       as: "review_avg"
  //                     }
  //                   },
  //                   //   {
  //                   //       $unwind: {
  //                   //         path: "$review_avg",
  //                   //         preserveNullAndEmptyArrays: true,
  //                   //       },
  //                   //     },
  //                   {
  //                     $match: { review_avg: { $ne: [] } }
  //                   }
  //                 ]
  //               }
  //             }
  //             // {
  //             //   $addFields: {
  //             //     review_avg: { $first: "$book_package.review_avg"  }
  //             //   },
  //             // },
  //             // {
  //             //   $unwind: {
  //             //     path: "$book_package",
  //             //     preserveNullAndEmptyArrays: true,
  //             //   },
  //             // },
  //           ]
  //         }
  //       },

  //       // {
  //       //         $unwind: {
  //       //           path: "$bid",
  //       //           preserveNullAndEmptyArrays: true,
  //       //         }
  //       //       },
  //       //  {
  //       //     $addFields: {
  //       //         star: { $first: "$book_package.review_avg.star" }
  //       //     },
  //       //   },
  //       {
  //         $project: {
  //           _id: 1,
  //           bid: {
  //             book_package: {
  //               review_avg: 1
  //             }
  //           }
  //         }
  //       }
  //     ]);

  //     // var temp = 0;

  //     //     for (let i = 0; i < Display_review.length; i++) {
  //     //       //  for (let j = 0; j < Display_review[i].bid.length; j++) {
  //     //           // for (let k = 0; k < Display_review[i].bid[j].book_package.length; k++) {
  //     //               if (!Display_review[0].bid.book_package.review_avg.length
  //     //   ) {
  //     //     // console.log(Display_review[0].review_count);
  //     //     Display_review[0].review_count =
  //     //       Display_review[0].bid.book_package.review_avg.length;
  //     //     Display_review[0].bid.book_package.review_avg = 0;
  //     //   } else {
  //     //     // console.log(Display_review[0].review_count);
  //     //     // console.log(temp);
  //     //     temp += Display_review[0].bid.book_package.review_avg.length;
  //     //     Display_review[0].review_count = temp;

  //     //     let review = [];
  //     //     for (
  //     //       let l = 0; l< Display_review[0].bid.book_package.review_avg.length;l++
  //     //      ) {
  //     //       review.push(
  //     //         parseFloat(
  //     //           Display_review[0].bid.book_package.review_avg[l].star
  //     //         )
  //     //       );
  //     //     }
  //     //     let total = 0;
  //     //     review.forEach((e) => {
  //     //       total += e;
  //     //     });
  //     //     const avg = total / review.length;
  //     //     console.log(avg);
  //     //     Display_review[0].review_avg = Math.floor(avg);
  //     //     // console.log(Display_review[i].review_avg = Math.floor(avg));
  //     //   }
  //     //   // console.log("456");
  //     //         // console.log( delete Display_review[0].bid);
  //     //         delete Display_review[0].bid
  //     //         // console.log("123");
  //     //           // }
  //     //       //  }

  //     //     }

  //     var temp = 0;

  //     for (let i = 0; i < Display_review.length; i++) {
  //       for (let j = 0; j < Display_review[i].bid.length; j++) {
  //         // for (let k = 0; k < Display_review[i].bid[j].book_package.length; k++) {
  //         if (!Display_review[0].bid[j].book_package[0].review_avg.length) {
  //           // console.log(Display_review[0].review_count);
  //           Display_review[0].review_count = Display_review[0].bid[j].book_package[0].review_avg.length;
  //           Display_review[0].bid[j].book_package[0].review_avg = 0;
  //         } else {
  //           // console.log(Display_review[0].review_count);
  //           console.log(temp);
  //           temp += Display_review[0].bid[j].book_package[0].review_avg.length;
  //           Display_review[0].review_count = temp;

  //           let review = [];
  //           for (let l = 0; l < Display_review[0].bid[j].book_package[0].review_avg.length; l++) {
  //             review.push(parseFloat(Display_review[0].bid[j].book_package[0].review_avg[l].star));
  //           }
  //           let total = 0;
  //           review.forEach((e) => {
  //             total += e;
  //           });
  //           const avg = total / review.length;
  //           console.log(avg);
  //           Display_review[0].review_avg = Math.floor(avg);
  //           // console.log(Display_review[i].review_avg = Math.floor(avg));
  //         }
  //         // console.log("456");
  //         // console.log( delete Display_review[0].bid[j]);
  //         delete Display_review[0].bid[j];
  //         // console.log("123");
  //       }
  //       //  }
  //     }

  //     // }

  //     //     var temp = 0;

  //     //     for (let i = 0; i < Display_review.length; i++) {
  //     //        for (let j = 0; j < Display_review[0].bid.length; j++) {
  //     //           for (let k = 0; k < Display_review[0].bid[j].book_package.length; k++) {

  //     //       if (
  //     //         !Display_review[0].bid[j].book_package[0].review_avg.length
  //     //       ) {
  //     //         // console.log(Display_review[0].review_count);
  //     //         Display_review[0].review_count =
  //     //           Display_review[0].bid[j].book_package[0].review_avg.length;
  //     //         Display_review[0].bid[j].book_package[0].review_avg = 0;
  //     //       } else {
  //     //         // console.log(Display_review[0].review_count);
  //     //         temp += Display_review[0].bid[j].book_package[0].review_avg.length;
  //     //         Display_review[0].review_count = temp;

  //     //         let review = [];
  //     //         for (
  //     //           let l = 0;l < Display_review[0].bid[j].book_package[0].review_avg.length;l++
  //     //          ) {
  //     //           review.push(
  //     //             parseFloat(
  //     //               Display_review[0].bid[j].book_package[0].review_avg[l].star
  //     //             )
  //     //           );
  //     //         }
  //     //         let total = 0;
  //     //         review.forEach((e) => {
  //     //           total += e;
  //     //         });
  //     //         const avg = total / review.length;
  //     //         console.log(avg);
  //     //         Display_review[0].review_avg = Math.floor(avg);
  //     //         // console.log(Display_review[i].review_avg = Math.floor(avg));
  //     //       }
  //     //       console.log("456");
  //     //             console.log( delete Display_review[0].bid[j]);
  //     //             delete Display_review[0].bid[j]
  //     //             console.log("123");
  //     //     }
  //     //     }
  //     //  }
  //     return this.sendJSONResponse(
  //       res,
  //       " display data ",
  //       {
  //         length: 1
  //       },
  //       Display_review
  //     );
  //   } catch (error) {
  //     if (error instanceof NotFound) {
  //       console.log(error); // throw error;
  //     }
  //     return this.sendErrorResponse(req, res, error);
  //   }
  // }

  async Display_review(req, res) {
    try {
      let book_package_id = req.query.book_package_id;
      console.log(book_package_id);

      const tokenData = req.userData;
      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });
      console.log(userData);
      if (userData[0].role !== "customer") {
        throw new Forbidden("you are not customer");
      }

      let reviewDisplay = await reviewSchema.aggregate([
        {
          $match: {
            book_package_id: new mongoose.Types.ObjectId(book_package_id),
            user_id: new mongoose.Types.ObjectId(tokenData.id)
          }
        },
        {
          $project: {
            _id: 1,
            user_id: 1,
            book_package_id: 1,
            star: 1,
            comment_box: 1
          }
        }
      ]);

      res.status(200).json({
        success: true,
        message: "review display successfully",
        data: reviewDisplay
      });
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async updatereview(req, res) {
    try {
      const review_id = req.query._id;
      const tokenData = req.userData;
      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });
      if (userData[0].role !== "customer") {
        throw new Forbidden("you are not customer");
      }

      const data = {
        star: req.body.star,
        book_package_id: req.body.book_package_id,
        comment_box: req.body.comment_box
      };

      const updatereview = await reviewSchema.findByIdAndUpdate({ _id: review_id }, data, { new: true });
      return this.sendJSONResponse(
        res,
        "review updated",
        {
          length: 1
        },
        updatereview
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_agencys_all_review(req, res) {
    try {
      const id = req.query._id;
      const tokenData = req.userData;
      if (!tokenData) {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });
      if (userData[0].role !== "customer") {
        throw new Forbidden("you are not customer");
      }

      const display_agencys_all_review = await Bidschema.aggregate([
        {
          $match: { agency_id: mongoose.Types.ObjectId(id) }
        },
        {
          $lookup: {
            from: "book_packages",
            localField: "_id",
            foreignField: "bid_package_id",
            as: "book_package",
            pipeline: [
              {
                $lookup: {
                  from: "reviews",
                  localField: "_id",
                  foreignField: "book_package_id",
                  as: "review",
                  pipeline: [
                    {
                      $lookup: {
                        from: "customers",
                        localField: "user_id",
                        foreignField: "user_id",
                        as: "customer"
                      }
                    }
                  ]
                }
              }
            ]
          }
        },
        {
          $unwind: "$book_package"
        },
        {
          $unwind: "$book_package.review"
        },
        {
          $group: {
            _id: "$_id",
            agency_id: { $first: "$agency_id" },
            book_package: { $push: "$book_package" },
            average_star: { $avg: { $toDouble: "$book_package.review.star" } },
            total_reviews: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 1,
            agency_id: 1,
            departure: 1,
            destination: 1,
            book_package: {
              _id: 1,
              review: {
                _id: 1,
                user_id: 1,
                star: 1,
                comment_box: 1,
                customer: {
                  _id: 1,
                  name: 1,
                  photo: 1
                }
              }
            },
            average_star: 1,
            total_reviews: 1
          }
        }
      ]);

      // Calculate the average star rating
      let totalStars = 0;
      let totalReviews = 0;

      // Iterate through each entry in the response
      for (const entry of display_agencys_all_review) {
        // Add the stars of each review to the totalStars
        totalStars += entry.average_star * entry.total_reviews;
        // Add the total number of reviews to the totalReviews
        totalReviews += entry.total_reviews;
      }

      // Calculate the average star rating
      const averageStarRating = totalStars / totalReviews;
      const totalReview = totalReviews;

      return this.sendJSONResponse(
        res,
        " display data ",
        {
          length: display_agencys_all_review.length,
          average_star_rating: averageStarRating,
          total_review: totalReview
        },
        display_agencys_all_review
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_agencys_all_review_agency(req, res) {
    try {
      const tokenData = req.userData;
      if (!tokenData) {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });
      if (userData[0].role !== "agency") {
        throw new Forbidden("you are not agency");
      }

      const display_agencys_all_review = await Bidschema.aggregate([
        {
          $match: { agency_id: mongoose.Types.ObjectId(tokenData.id) }
        },
        {
          $lookup: {
            from: "book_packages",
            localField: "_id",
            foreignField: "bid_package_id",
            as: "book_package",
            pipeline: [
              {
                $lookup: {
                  from: "reviews",
                  localField: "_id",
                  foreignField: "book_package_id",
                  as: "review",
                  pipeline: [
                    {
                      $lookup: {
                        from: "customers",
                        localField: "user_id",
                        foreignField: "user_id",
                        as: "customer"
                      }
                    }
                  ]
                }
              }
            ]
          }
        },
        {
          $unwind: "$book_package"
        },
        {
          $unwind: "$book_package.review"
        },
        {
          $group: {
            _id: "$_id",
            agency_id: { $first: "$agency_id" },
            book_package: { $push: "$book_package" },
            average_star: { $avg: { $toDouble: "$book_package.review.star" } },
            total_reviews: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 1,
            agency_id: 1,
            departure: 1,
            destination: 1,
            book_package: {
              _id: 1,
              review: {
                _id: 1,
                user_id: 1,
                star: 1,
                comment_box: 1,
                customer: {
                  _id: 1,
                  name: 1,
                  photo: 1
                }
              }
            },
            average_star: 1,
            total_reviews: 1
          }
        }
      ]);

      const display_agencys_all_review_package = await packageSchema.aggregate([
        {
          $match: { user_id: mongoose.Types.ObjectId(tokenData.id) }
        },
        {
          $lookup: {
            from: "book_packages",
            localField: "_id",
            foreignField: "package_id",
            as: "book_package",
            pipeline: [
              {
                $lookup: {
                  from: "reviews",
                  localField: "_id",
                  foreignField: "book_package_id",
                  as: "review",
                  pipeline: [
                    {
                      $lookup: {
                        from: "customers",
                        localField: "user_id",
                        foreignField: "user_id",
                        as: "customer"
                      }
                    }
                  ]
                }
              }
            ]
          }
        },
        {
          $unwind: "$book_package"
        },
        {
          $unwind: "$book_package.review"
        },
        {
          $group: {
            _id: "$_id",
            agency_id: { $first: "$user_id" },
            book_package: { $push: "$book_package" },
            average_star: { $avg: { $toDouble: "$book_package.review.star" } },
            total_reviews: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 1,
            agency_id: 1,
            departure: 1,
            destination: 1,
            book_package: {
              _id: 1,
              review: {
                _id: 1,
                user_id: 1,
                star: 1,
                comment_box: 1,
                customer: {
                  _id: 1,
                  name: 1,
                  photo: 1
                }
              }
            },
            average_star: 1,
            total_reviews: 1
          }
        }
      ]);

      const combinedReviewData = [...display_agencys_all_review, ...display_agencys_all_review_package];

      const formattedReviews = combinedReviewData.flatMap((entry) =>
        entry.book_package.map((bookPackage) => ({
          _id: entry._id,
          agency_id: entry.agency_id,
          book_package: [
            {
              _id: bookPackage._id,
              review: {
                _id: bookPackage.review._id,
                user_id: bookPackage.review.user_id,
                star: bookPackage.review.star,
                comment_box: bookPackage.review.comment_box,
                customer: bookPackage.review.customer
              }
            }
          ],
          average_star: entry.average_star,
          total_reviews: entry.total_reviews
        }))
      );

      // Calculate total stars and reviews from the flattened reviews
      let totalStars = 0;
      let totalReviews = formattedReviews.length;

      formattedReviews.forEach((entry) => {
        totalStars += Number(entry.book_package[0].review.star); // Convert to number in case star is string
      });

      // Calculate the average star rating
      const averageStarRating = Number(totalReviews > 0 ? (totalStars / totalReviews).toFixed(2) : 0);

      // Send the response
      return this.sendJSONResponse(
        res,
        "Display data",
        {
          length: formattedReviews.length,
          average_star_rating: averageStarRating,
          total_review: totalReviews
        },
        formattedReviews
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_admin_review(req, res) {
    try {
      const tokenData = req.userData;
      if (!tokenData) {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });
      if (userData[0].role !== "admin") {
        throw new Forbidden("you are not admin");
      }

      const display_admins_all_review_package = await packageSchema.aggregate([
        {
          $match: { user_id: mongoose.Types.ObjectId(tokenData.id) }
        },
        {
          $lookup: {
            from: "book_packages",
            localField: "_id",
            foreignField: "package_id",
            as: "book_package",
            pipeline: [
              {
                $lookup: {
                  from: "reviews",
                  localField: "_id",
                  foreignField: "book_package_id",
                  as: "review",
                  pipeline: [
                    {
                      $lookup: {
                        from: "customers",
                        localField: "user_id",
                        foreignField: "user_id",
                        as: "customer"
                      }
                    }
                  ]
                }
              }
            ]
          }
        },
        {
          $unwind: "$book_package"
        },
        {
          $unwind: "$book_package.review"
        },
        {
          $group: {
            _id: "$_id",
            agency_id: { $first: "$user_id" },
            book_package: { $push: "$book_package" },
            average_star: { $avg: { $toDouble: "$book_package.review.star" } },
            total_reviews: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 1,
            agency_id: 1,
            departure: 1,
            destination: 1,
            book_package: {
              _id: 1,
              review: {
                _id: 1,
                user_id: 1,
                star: 1,
                comment_box: 1,
                customer: {
                  _id: 1,
                  name: 1,
                  photo: 1
                }
              }
            },
            average_star: 1,
            total_reviews: 1
          }
        }
      ]);

      const formattedReviews = display_admins_all_review_package.flatMap((entry) =>
        entry.book_package.map((bookPackage) => ({
          _id: entry._id,
          agency_id: entry.agency_id,
          book_package: [
            {
              _id: bookPackage._id,
              review: {
                _id: bookPackage.review._id,
                user_id: bookPackage.review.user_id,
                star: bookPackage.review.star,
                comment_box: bookPackage.review.comment_box,
                customer: bookPackage.review.customer
              }
            }
          ],
          average_star: entry.average_star,
          total_reviews: entry.total_reviews
        }))
      );

      // Calculate total stars and reviews from the flattened reviews
      let totalStars = 0;
      let totalReviews = formattedReviews.length;

      formattedReviews.forEach((entry) => {
        totalStars += Number(entry.book_package[0].review.star); // Convert to number in case star is string
      });

      // Calculate the average star rating
      const averageStarRating = Number(totalReviews > 0 ? (totalStars / totalReviews).toFixed(2) : 0);

      return this.sendJSONResponse(
        res,
        "Display data",
        {
          length: formattedReviews.length,
          average_star_rating: averageStarRating,
          total_review: totalReviews
        },
        formattedReviews
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_all_reviews(req, res) {
    try {
      const tokenData = req.userData;
      if (!tokenData) {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });
      if (userData[0].role !== "admin") {
        throw new Forbidden("you are not admin");
      }

      const filter = req.query.filter; // 'agency', 'admin', or 'all'

      let reviews = [];
      if (filter === "agency") {
        const display_agencys_all_review = await Bidschema.aggregate([
          // {
          //   $match: { agency_id: mongoose.Types.ObjectId(tokenData.id) }
          // },
          {
            $lookup: {
              from: "book_packages",
              localField: "_id",
              foreignField: "bid_package_id",
              as: "book_package",
              pipeline: [
                {
                  $lookup: {
                    from: "reviews",
                    localField: "_id",
                    foreignField: "book_package_id",
                    as: "review",
                    pipeline: [
                      {
                        $lookup: {
                          from: "customers",
                          localField: "user_id",
                          foreignField: "user_id",
                          as: "customer"
                        }
                      }
                    ]
                  }
                }
              ]
            }
          },
          {
            $unwind: "$book_package"
          },
          {
            $unwind: "$book_package.review"
          },
          {
            $group: {
              _id: "$_id",
              agency_id: { $first: "$agency_id" },
              book_package: { $push: "$book_package" },
              average_star: { $avg: { $toDouble: "$book_package.review.star" } },
              total_reviews: { $sum: 1 }
            }
          },
          {
            $project: {
              _id: 1,
              agency_id: 1,
              departure: 1,
              destination: 1,
              book_package: {
                _id: 1,
                review: {
                  _id: 1,
                  user_id: 1,
                  star: 1,
                  comment_box: 1,
                  customer: {
                    _id: 1,
                    name: 1,
                    photo: 1
                  }
                }
              },
              average_star: 1,
              total_reviews: 1
            }
          }
        ]);

        const display_agencys_all_review_package = await packageSchema.aggregate([
          {
            $match: {
              $expr: {
                $ne: ["$user_id", mongoose.Types.ObjectId(tokenData.id)]
              }
            }
          },
          {
            $lookup: {
              from: "book_packages",
              localField: "_id",
              foreignField: "package_id",
              as: "book_package",
              pipeline: [
                {
                  $lookup: {
                    from: "reviews",
                    localField: "_id",
                    foreignField: "book_package_id",
                    as: "review",
                    pipeline: [
                      {
                        $lookup: {
                          from: "customers",
                          localField: "user_id",
                          foreignField: "user_id",
                          as: "customer"
                        }
                      }
                    ]
                  }
                }
              ]
            }
          },
          {
            $unwind: "$book_package"
          },
          {
            $unwind: "$book_package.review"
          },
          {
            $group: {
              _id: "$_id",
              agency_id: { $first: "$user_id" },
              book_package: { $push: "$book_package" },
              average_star: { $avg: { $toDouble: "$book_package.review.star" } },
              total_reviews: { $sum: 1 }
            }
          },
          {
            $project: {
              _id: 1,
              agency_id: 1,
              departure: 1,
              destination: 1,
              book_package: {
                _id: 1,
                review: {
                  _id: 1,
                  user_id: 1,
                  star: 1,
                  comment_box: 1,
                  customer: {
                    _id: 1,
                    name: 1,
                    photo: 1
                  }
                }
              },
              average_star: 1,
              total_reviews: 1
            }
          }
        ]);

        reviews = [...display_agencys_all_review, ...display_agencys_all_review_package];
      } else if (filter === "admin") {
        reviews = await packageSchema.aggregate([
          {
            $match: { user_id: mongoose.Types.ObjectId(tokenData.id) }
          },
          {
            $lookup: {
              from: "book_packages",
              localField: "_id",
              foreignField: "package_id",
              as: "book_package",
              pipeline: [
                {
                  $lookup: {
                    from: "reviews",
                    localField: "_id",
                    foreignField: "book_package_id",
                    as: "review",
                    pipeline: [
                      {
                        $lookup: {
                          from: "customers",
                          localField: "user_id",
                          foreignField: "user_id",
                          as: "customer"
                        }
                      }
                    ]
                  }
                }
              ]
            }
          },
          {
            $unwind: "$book_package"
          },
          {
            $unwind: "$book_package.review"
          },
          {
            $group: {
              _id: "$_id",
              agency_id: { $first: "$user_id" },
              book_package: { $push: "$book_package" },
              average_star: { $avg: { $toDouble: "$book_package.review.star" } },
              total_reviews: { $sum: 1 }
            }
          },
          {
            $project: {
              _id: 1,
              agency_id: 1,
              book_package: {
                _id: 1,
                review: {
                  _id: 1,
                  user_id: 1,
                  star: 1,
                  comment_box: 1,
                  customer: {
                    _id: 1,
                    name: 1,
                    photo: 1
                  }
                }
              },
              average_star: 1,
              total_reviews: 1
            }
          }
        ]);
      } else if (filter === "all") {
        const display_agencys_all_review = await Bidschema.aggregate([
          // {
          //   $match: { agency_id: mongoose.Types.ObjectId(tokenData.id) }
          // },
          {
            $lookup: {
              from: "book_packages",
              localField: "_id",
              foreignField: "bid_package_id",
              as: "book_package",
              pipeline: [
                {
                  $lookup: {
                    from: "reviews",
                    localField: "_id",
                    foreignField: "book_package_id",
                    as: "review",
                    pipeline: [
                      {
                        $lookup: {
                          from: "customers",
                          localField: "user_id",
                          foreignField: "user_id",
                          as: "customer"
                        }
                      }
                    ]
                  }
                }
              ]
            }
          },
          {
            $unwind: "$book_package"
          },
          {
            $unwind: "$book_package.review"
          },
          {
            $group: {
              _id: "$_id",
              agency_id: { $first: "$agency_id" },
              book_package: { $push: "$book_package" },
              average_star: { $avg: { $toDouble: "$book_package.review.star" } },
              total_reviews: { $sum: 1 }
            }
          },
          {
            $project: {
              _id: 1,
              agency_id: 1,
              departure: 1,
              destination: 1,
              book_package: {
                _id: 1,
                review: {
                  _id: 1,
                  user_id: 1,
                  star: 1,
                  comment_box: 1,
                  customer: {
                    _id: 1,
                    name: 1,
                    photo: 1
                  }
                }
              },
              average_star: 1,
              total_reviews: 1
            }
          }
        ]);

        const display_agencys_all_review_package = await packageSchema.aggregate([
          // {
          //   $match: { user_id: mongoose.Types.ObjectId(tokenData.id) }
          // },
          {
            $lookup: {
              from: "book_packages",
              localField: "_id",
              foreignField: "package_id",
              as: "book_package",
              pipeline: [
                {
                  $lookup: {
                    from: "reviews",
                    localField: "_id",
                    foreignField: "book_package_id",
                    as: "review",
                    pipeline: [
                      {
                        $lookup: {
                          from: "customers",
                          localField: "user_id",
                          foreignField: "user_id",
                          as: "customer"
                        }
                      }
                    ]
                  }
                }
              ]
            }
          },
          {
            $unwind: "$book_package"
          },
          {
            $unwind: "$book_package.review"
          },
          {
            $group: {
              _id: "$_id",
              agency_id: { $first: "$user_id" },
              book_package: { $push: "$book_package" },
              average_star: { $avg: { $toDouble: "$book_package.review.star" } },
              total_reviews: { $sum: 1 }
            }
          },
          {
            $project: {
              _id: 1,
              agency_id: 1,
              departure: 1,
              destination: 1,
              book_package: {
                _id: 1,
                review: {
                  _id: 1,
                  user_id: 1,
                  star: 1,
                  comment_box: 1,
                  customer: {
                    _id: 1,
                    name: 1,
                    photo: 1
                  }
                }
              },
              average_star: 1,
              total_reviews: 1
            }
          }
        ]);

        reviews = [...display_agencys_all_review, ...display_agencys_all_review_package];
      } else {
        return res.status(400).json({
          message: "Invalid filter. Use 'agency', 'admin', or 'all'."
        });
      }

      const formattedReviews = reviews.flatMap((entry) =>
        entry.book_package
          ? entry.book_package.map((bookPackage) => ({
              _id: entry._id,
              agency_id: entry.agency_id,
              book_package: [
                {
                  _id: bookPackage._id,
                  review: {
                    _id: bookPackage.review._id,
                    user_id: bookPackage.review.user_id,
                    star: bookPackage.review.star,
                    comment_box: bookPackage.review.comment_box,
                    customer: bookPackage.review.customer
                  }
                }
              ],
              average_star: entry.average_star,
              total_reviews: entry.total_reviews
            }))
          : [
              {
                _id: entry._id,
                user_id: entry.user_id,
                book_package_id: entry.book_package_id,
                star: entry.star,
                comment_box: entry.comment_box,
                customer: entry.customer
              }
            ]
      );

      let totalStars = 0;
      let totalReviews = formattedReviews.length;

      formattedReviews.forEach((entry) => {
        totalStars += Number(entry.book_package ? entry.book_package[0].review.star : entry.star);
      });

      const averageStarRating = Number(totalReviews > 0 ? (totalStars / totalReviews).toFixed(1) : 0);

      // const averageStarRating = Math.ceil(totalReviews > 0 ? (totalStars / totalReviews) : 0);

      return this.sendJSONResponse(
        res,
        "Display data",
        {
          length: formattedReviews.length,
          average_star_rating: averageStarRating,
          total_review: totalReviews
        },
        formattedReviews
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error);
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
