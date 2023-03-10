/*********************************************************************************
 *  WEB322 – Assignment 03
 *  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
 *  of this assignment has been copied manually or electronically from any other source 
 *  (including 3rd party web sites) or distributed to other students.
 * 
 *  Name: ____Emiliya Aghayeva__________________ Student ID: _____148398217_________ Date: ______10.03.2023__________
 *
 *  Online (Cyclic) Link: ________________________________________________________
 *   GitHub: https://github.com/eaghayeva/Assignment4
 ********************************************************************************/



var express = require('express');
const exphbs = require('express-handlebars');
var app = express();
var path = require("path");
var blogService = require("./blog-service");
const fs = require('fs');
const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')
const stripJs = require('strip-js');

const bodyparser = require('body-parser');
app.use(express.static('public'))
app.use(bodyparser.json());

var HTTP_PORT = process.env.PORT || 8080;

cloudinary.config({
    cloud_name: 'dp3hbncmb',
    api_key: '283872449448813',
    api_secret: '4ShBBtluuAOtsoorh5iFS7YVEiw',
    secure: true
});

app.set('view engine', '.hbs');

app.use(function(req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});

const upload = multer();



app.engine('.hbs', exphbs.engine({
    extname: '.hbs',
    defaultLayout: 'main',

    helpers: {
        navLink: function(url, options) {
            return '<li' +
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
                '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        safeHTML: function(context) {
            return stripJs(context);

        },

        equal: function(lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }

    }
}));

function onHttpStart() {
    console.log("Express http server listening on:  " + HTTP_PORT);
}


app.get('/', (req, res) => {
    res.redirect('/about');
});

app.get("/about", function(req, res) {
    res.render(path.join(__dirname + "/views/about.hbs"));
});


app.get('/blog', async(req, res) => {
    var viewData = { post: {}, posts: [] };
    try {
        let posts = [];
        if (req.query.category) {
            posts = await blogService.getPostsByCategory(req.query.category);
        } else {
            posts = await blogService.getAllPosts();
        }
        posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));
        let post = posts[0];
        viewData.posts = posts;
        viewData.post = post;

    } catch (err) {
        viewData.message = "no results";
    }
    try {
        let categories = await blogService.getCategories();
        viewData.categories = categories;
    } catch (err) {
        viewData.categoriesMessage = "no results"
    }
    console.log(viewData.post);
    res.render("blog", { data: viewData })

});


app.get('/blog/:id', async(req, res) => { 
    var viewData = { post: {}, posts: [] };
    try {
        let posts = [];
        if (req.query.category) {
            posts = await blogService.getPublishedPostsByCategory(req.query.category);
        } else {
            posts = await blogService.getPublishedPosts();
        }
        posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));
        viewData.posts = posts;
    } catch (err) {
        viewData.message = "no results";
    }
    try {
        viewData.post = await blogService.getPostById(req.params.id);
    } catch (err) {
        viewData.message = "no results";
    }
    try {
        let categories = await blogService.getCategories();
        viewData.categories = categories;
    } catch (err) {
        viewData.categoriesMessage = "no results"
    }
    res.render("blog", { data: viewData })
});

app.get("/posts", function(req, res) {
    let category = req.query.category;
    let minDate = req.query.minDate;
    if (category) {
        blogService.getPostsByCategory(category).then(data => {
            if (data.length > 0) {
                res.render("posts", { posts: data });
            } else {
                res.render("posts", { message: "no results" });
            }
        })
    } else if (minDate != "" && minDate != null) {
        blogService.getPostsByMinDate(minDate).then(data => {
            if (data.length > 0) {
                res.render("posts", { posts: data });
            } else {
                res.render("posts", { message: "no results" });
            }
        })
    } else {
        blogService.getAllPosts().then(data => {
            if (data.length > 0) {
                res.render("posts", { posts: data });
            } else {
                res.render("posts", { message: "no results" });
            }
        })
    }
});

app.get("/categories", function(req, res) {

    blogService.getCategories().then(data => {
        if (data.length > 0) {
            res.render("categories", { categories: data });
        } else {
            res.render("categories", { message: "no results" });
        }
    })
});

app.get('/posts/add', (req, res) => {

    res.render(path.join(__dirname + "/views/addPost.hbs"));
});

app.post("/posts/add", upload.single("featureImage"), (req, res) => {

    let streamUpload = (req) => {
        return new Promise((resolve, reject) => {
            let stream = cloudinary.uploader.upload_stream(
                (error, result) => {
                    if (result) {
                        resolve(result);
                    } else {
                        reject(error);
                    }
                }
            );

            streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
    };

    async function upload(req) {
        let result = await streamUpload(req);
        console.log(result);
        return result;
    }

    upload(req).then((uploaded) => {
        req.body.featureImage = uploaded.url;
        // TODO: Process the req.body and add it as a new Blog Post before redirecting to /posts

        var postData = req.body;
        blogService.addPost(postData).then(data => {
            res.redirect('/posts');
        }).catch(err => {
            res.send(err);
        });


    });


});

app.get("*", (req, res) => {
        res.render(path.join(__dirname + "/views/pnf.hbs"));
    }) // if no matching route is found default to 404 with message "Page Not Found"



blogService.initialize().then(() => {
    app.listen(HTTP_PORT, onHttpStart);

}).catch(() => {
    console.log("error");
});
