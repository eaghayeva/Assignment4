const fs = require("fs");
const { builtinModules } = require('module');


//Declaring arrays globally.
let posts = [];
let categories = [];

module.exports.initialize = function() {
    return new Promise((resolve, reject) => {
        fs.readFile('./data/posts.json', 'utf8', (err, data) => {
            if (err) {
                reject('unable to read file');
            } else {
                posts = JSON.parse(data);

                fs.readFile('./data/categories.json', 'utf8', (err, data) => { //what is data?
                    if (err) {
                        reject('unable to read file');
                    } else {
                        categories = JSON.parse(data); //converts file's contets into an array of object
                        resolve(); //ask (, invoke the resolve method for the promise to communicate back to server.js that the operation was a success.)
                    }
                });

            }
        });

    })
}

module.exports.getAllPosts = function() {
    return new Promise((resolve, reject) => {
        if (posts.length == 0) {
            reject("no message");
        } else {
            resolve(posts); //
        }
    });
}




module.exports.getCategories = function() {
    return new Promise((resolve, reject) => {
        if (categories.length == 0) {
            reject("no message");
        } else {
            resolve(categories);
        }
    });
}

module.exports.getPublishedPosts = function() {
    return new Promise((resolve, reject) => {
        let publisheedPosts = posts.filter(post => post.published === true);
        if (posts.length == 0) {
            reject("no message");
        } else {
            resolve(publisheedPosts);
        }

    })
}

module.exports.addPost = function(postData) {
    return new Promise(async(resolve, reject) => {
        if (postData.published == undefined) {
            postData.published = false;
        } else {
            postData.published = true;
        }

        postData.postDate = new Date();
        postData.id = posts.length + 1;
        posts.push(postData);
        resolve(postData);
        reject("error");


    })
}


module.exports.getPostsByCategory = (category) => {
    return new Promise(function(resolve, reject) {
        const df = fs.readFileSync('./data/posts.json');
        var publishedPosts = JSON.parse(df);
        var filtered = publishedPosts.filter(a => a.category == category);
        if (filtered.length > 0) {
            resolve(filtered);
        } else {
            reject("no results returned");
        }
    });
};

module.exports.getPostsByMinDate = (minDateStr) => {
    return new Promise((resolve, reject) => {
        const df = fs.readFileSync('./data/posts.json');
        var publishedPosts = JSON.parse(df);
        var filtered = publishedPosts.filter(a => new Date(a.postDate) >= new Date(minDateStr));
        if (filtered.length > 0) {
            resolve(filtered);
        } else {
            reject("no results returned");
        }

    });
}

module.exports.getPostById = (id) => {
    return new Promise((resolve, reject) => {
        const df = fs.readFileSync('./data/posts.json');
        var publishedPosts = JSON.parse(df);
        var filtered = publishedPosts.filter(a => a.id == id);
        if (filtered.length > 0) {
            resolve(filtered);
        } else {
            reject("no results returned");
        }
    });
}

// getPublishedPostsByCategory Route
module.exports.getPublishedPostsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        var filtered = posts.filter(post => post.published == true && post.category == category);
        if (filtered.length > 0) {
            resolve(filtered);
        } else {
            reject("no results returned");
        }
    });
}