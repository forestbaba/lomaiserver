const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken');
const Post = require("./postModel");
const User = require("../users/userModel");
const path = require('path');
const Resize = require('../../helpers/Resize')
const upload = require('../../helpers/uploadMiddleware');
const queryString = require('query-string');


const BASE_URL = "http://localhost:13000/"
router.post("/create", (req, res) => {

    if (!req.body.title) {
        return res.status(400).json({ error: true, message: "title required" })
    }
    if (!req.body.user) {
        return res.status(400).json({ error: true, message: "user is required" })
    }

    const newPost = new Post({
        user: req.body.user,
        title: req.body.title,
        name:  req.body.name,
        description: req.body.description,
        date: req.body.date,
        start_date: req.body.start_date,
        end_date: req.body.end_date
    }).save().then(post => {
        return res.status(200).json({error: false, message:"Post created"})
    })
        .catch(err => {
        return res.status(200).json({error: true, message:"error creating post"})
    })

})

  
router.post("/create2/:data", async(req, res) => {

   // ${data2.user}/${data2.date}/${data2.name}/${data2.title}/${data2.description}
    console.log('********',queryString.parse(req.params.data))
    let extra = queryString.parse(req.params.data)
    console.log('=======', extra)

    upload(req, res, async function (err) {
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({error: true, message:"image file too large"})
                // 'File too large'
            } else {
                var result = { 
                    'status': 'Fail',
                    'error': err
                };
                res.end(result);
            }
        } else {
            console.log('====', req.params)
            console.log("file =>", req.file); 
        
            let filename;
            const imagePath = path.join(__dirname, '../uploads');
            const fileUpload = new Resize(imagePath);
            if(!extra.user){
                return res.status(400).json({error: true, message:"user is required"})
            }
            if (!req.file) {
                console.log('JJJJJJJ', req.file)
                res.status(401).json({ error: 'Please provide an image' });
            }
            if (!req.file || !req.file === undefined) {
        
            } else {
                filename = await fileUpload.save(req.file.buffer);
                let imageurl = BASE_URL + filename

                const newPost = new Post({
                    user:        extra.user,
                    title:       extra.title,
                    name:        extra.name,
                    description: extra.description,
                    date:        extra.date,
                    image:       imageurl,
                    date:        extra.date,
                    start_date:  extra.start_date,
                    end_date:    extra.end_date
                }).save().then(post => {
                    return res.status(200).json({error: false, message:"Post created"})
                })
                    .catch(err => {
                    return res.status(200).json({error: true, message:"error creating post"})
                })
        
                // User.findOne({_id: req.params.user})
                // .then(user =>{
                //     if(user){
                //         user.image = imageurl
                //         user.save()
                //         .then(() =>{
                //             return res.status(200).json({error: false, message:"Image uploaded"})
                //         }).catch(err =>{
                //             console.log('ERR: ', err)
                //             return res.status(400).json({error: true, message:"Error uploading image"})
                //         })
                //     }else{
                        
                //         return res.status(400).json({error:true, message:"user not found"})
                //     }
                // }).catch(err =>{
                //     console.log('ERR: ', err)
                // })
            }
        }
    })

    // if (!req.body.title) {
    //     return res.status(400).json({ error: true, message: "title required" })
    // }
    // if (!req.body.user) {
    //     return res.status(400).json({ error: true, message: "user is required" })
    // }

    // const newPost = new Post({
    //     user: req.body.user,
    //     title: req.body.title,
    //     name:  req.body.name,
    //     description: req.body.description,
    //     date: req.body.date
    // }).save().then(post => {
    //     return res.status(200).json({error: false, message:"Post created"})
    // })
    //     .catch(err => {
    //     return res.status(200).json({error: true, message:"error creating post"})
    // })

})

router.get('/fetchAll', (req, res) => {
    Post.find({})
        .then(post => {
        return res.status(200).json({error: false,posts:post})
        })
        .catch(err => {
        return res.status(400).json({error: true, message:'Error fetching posts'})
    })
})

router.post('/subscribe', (req, res) => {
    if (!req.body.user || !req.body.postId){
        return res.status(400).json({error: true, message:'user  and postId is required'})
    }else{
        User.findOne({_id: req.body.user})
        .then(user =>{
            if(user){
                console.log('YES')
                if(user.subscription.indexOf(req.body.postId) > -1)
                {
                    user.subscription.findIndex(index => console.log('------', index ))
                    return res.status(400).json({error: true, message:"subscription already exist"})
                }else{
                        user.subscription.push(req.body.postId)
                        user.save().then(() =>{
                        return res.status(200).json({error: false, message:"subscription done"})
                    })
                }
               
            }else{ 
                return res.status(400).json({error: true, message:"Error subscribing"})
            }
        })
        .catch(err =>{
            console.log('ERR: ', err)
        })
    }
})
router.post('/unsubscribe', (req, res) => {
    console.log('====>', req.body)
    if (!req.body.user || !req.body.postId){
        return res.status(400).json({error: true, message:'user and postId is required'})
    }else{
        User.findOne({_id: req.body.user}) 
        .then(user =>{
            if(user){

                if(user.subscription.indexOf(req.body.postId) >= 0){
                        user.subscription.pull(req.body.postId)
                        user.save().then(() =>{
                        return res.status(200).json({error: false, message:"unsubscription done"})
                    })
                }else{
                        return res.status(400).json({error: true, message:"subscription does not exist"})

                    }
            }else{
                return res.status(400).json({error: true, message:"Error subscribing"})
            }
        })
        .catch(err =>{
            console.log('ERR: ', err)
        })
    }
})

router.post('/fetchInterest',async (req, res) => {

    let fetchAllPost = await Post.find({});
    let toBeReturned = []
    User.findOne({_id: req.body.user})
    .then(user => {
        if(user){
            for(let i=0; i < user.subscription.reverse().length; i++){

                Post.findOne({_id: user.subscription[i]})
                .then(data =>{
                    console.log('>>>>>>>', data)
                    toBeReturned.push(data)
                }).catch(err =>{
                    console.log('ERR: ', err)
                }) 

               
            }
            setTimeout(() => {
             return res.status(200).json({error: false, subscription: toBeReturned})

            }, 1000);

        }else{
            return res.status(400).json({error: true, message:"User not found"})
        }
    })
    .catch(err =>{
        console.log('ERR: ', err)
        return res.status(400).json({error: true, message:"An error occurred, try again later"})
    })

})
router.post('/fetchUnsub',async (req, res) => {

    let fetchAllPost = await Post.find({});
    let toBeReturned = []
    User.findOne({_id: req.body.user})
    .then(user => {
        if(user){


            arr3 = [].concat(
                fetchAllPost.filter(obj1 => user.subscription.every(obj2 => obj1._id !== obj2)),
                user.subscription.filter(obj2 => fetchAllPost.every(obj1 => obj2 !== obj1._id))
            );

            // var index;
            // fetchAllPost.some(function (elem, i) {
            //          return elem.id === 'yutu' ? (index = i, true) : false;
            // });
            // console.log('=================ooo==', fetchAllPost.indexOf(user.subscription[i]))



            // for(let i=0; i < fetchAllPost.length; i++){
            //     let j = fetchAllPost[i]

            //     var indexOfStevie = user.subscription.findIndex(i => console.log('=**=',j._id));
            //     console.log('==0', indexOfStevie)
            //     console.log('==1',user.subscription[i])
            //     //console.log('==2')


            //     // if(fetchAllPost.findIndex(index => index.id === user.subscription[i] > 0)){
            //     //     let newindex = fetchAllPost.findIndex(index => console.log('+++++', user.subscription[i]))
            //     //     //toBeReturned.push(fetchAllPost[i])
            //     //     console.log('HHH: ',newindex)
            //     //     fetchAllPost.splice(i,1)
            //     // }
            // }
           // console.log('=======', arr3)

            return res.status(200).json({error: false, subscription: arr3})
        }else{
            return res.status(400).json({error: true, message:"User not found"})
        }
    })
    .catch(err =>{
        console.log('ERR: ', err)
        return res.status(400).json({error: true, message:"An error occurred, try again later"})
    })

})

router.post('/delete', (req, res) =>{
    Post.findOne({_id:req.body.postId})
    .then(post =>{
        if(post.user.toString() !== req.body.user){
            return res.status(400).json({error: true, message:"You are not authorised"})
        }else{
            Post.findOneAndRemove({_id: req.body.postId})
            .then(post =>{
                return res.status(200).json({error: false, message:"post deleted"})
            })
            .catch(err =>{
                return res.status(400).json({error: true, message:"Error deleting post"})
            })
        }
    }).catch(err=>{
        return res.status(400).json({error:true, message:"Something went wrong"})
    })
})
module.exports = router;