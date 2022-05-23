const express = require('express')
const app = express()
const bcrypt = require('bcrypt')

const User = require('./models/user-model')
// const Child = require('./models/child-model')
const keys = require('./config/keys')

const mongoose = require('mongoose');

const jwt = require("jsonwebtoken");
const ObjectId = require('mongodb').ObjectID;


// connect to mongodb
const db = mongoose.connect(keys.mongodb.dbURI, {
  useNewUrlParser: true, 
  useUnifiedTopology: true
}).then(()=>console.log('connected'))
.catch(e=>console.log("Error", e));



app.use(express.json())

const users = []

const authenticate = (req, res, next) => {
  // console.log(req.headers)
  try {

    const token = req.headers['authorization'].split(' ')[1];
    // console.log(token)
    const decode = jwt.verify(token, keys.jwtSecret.key)
    // console.log(decode)
    req.user = decode
    console.log(req.user)
    next()
  }
  catch (error){
    res.json({
      message:"Autjentication failed !",
      error:error
    })
  }
}

app.get('/users', (req, res) => {
  User.find().then(response => {
    console.log(response[0]._id)
    res.json({
      response
    })
  }).catch(err => {
    res.json({
      message:"An error occured!",
      error:err
    })
  })
})

app.get('/user/:id', (req, res) => {
  let userId = req.params
  console.log(userId)
  
  User.find( {"_id" : ObjectId(userId) } ).then(response => {
    console.log(response)
    res.json({
      response
    })
  }).catch(err => {
    res.json({
      message:"An error occured!",
      error:err
    })
  })
})

// update user details
app.get('/updateProfile/:id', (req, res) => {
  let userId = req.params
try {
  let updateData = {
    name : req.body.name,
    photo: req.body.photo
  }
  User.findByIdAndUpdate({"_id" : ObjectId(userId) }, {$set: updateData}).then(response => {
    res.json({
      message: "User data updated successfully!"
    })
  }).catch(err => {
    res.json({
      message:"An error occured!",
      error:err
    })
  })
}
catch {
  res.status(500).send("Failed to update, You are not registered user!")
}
})


// delete user
app.get('/deleteUser/:id', (req, res) => {
  let userId = req.params
try {
  User.findByIdAndRemove({"_id" : ObjectId(userId) }, (err, result)=> {
    if(err) {
      res.json({
        message:"some things wrong!",
        err
      })
    }else{
      res.json({
        message: "User deleted successfully!",
        result
      })
    }
  })
}
catch {
  res.status(500).send("Failed to delete, You are not registered user!")
}
})

app.post('/child/:id', async (req, res) => {
  try {
    let userId = req.params;
    const child = { name: req.body.name,relation: req.body.relation, month:req.body.month, year:req.body.year, photo: req.body.photo }
        let newChild = {
          id: child.name + child.month,
          name: child.name,
          month: child.month,
          year: child.year,
          photo: child.photo,
          relation:child.relation
        }
    User.findOneAndUpdate({ "_id" : ObjectId(userId)}, {$push: {childInfo: newChild} }, {new: true}, (err, result)=> {
      // var len = result.childInfo.length;
      // var childData = result.childInfo[]
      // console.log(typeof(len))
      if (err) {
        res.json({
          message:"Something wrong when updating data!"
        })
      }else{
        res.json({
          message:"Your child is added successfully!",
          // result: childData
        })
      }
    })
  } catch {
    res.status(500).send("Failed")
  }
})

// update child details
app.get('/child/updateProfile', (req, res) => {
  let userId = req.query.userID
  let childId = req.query.id
  console.log(userId,childId)
try {
  // let updateData = {
  //   name : req.body.name,
  //   photo: req.body.photo
  // }
  User.findByIdAndUpdate({"_id" : ObjectId(userId), "childInfo.id": childId }, {$set: {"childInfo.name": "azgar"}}).then(response => {
    console.log(response)
    res.json({
      message: "User data updated successfully!"
    })
  }).catch(err => {
    res.json({
      message:"An error occured!",
      error:err
    })
  })
}
catch {
  res.status(500).send("Failed to update, You are not registered user!")
}
})


app.post('/users', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    const user = { name: req.body.name, email:req.body.email, mobile:req.body.mobile, password: hashedPassword }
    User.findOne({ email: user.email }).then((userExist) => {
      console.log(userExist)
      if(userExist) {
        res.json({
          message:"User already registered",
          user: userExist
        })
      }
      else {
        new User({
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          password: user.password,
        }).save().then((newUser) => {
          res.json({
            message: "New user registered successfully",
            user: newUser
          })
        }).catch((err)=>{
          res.json({
            message:"An error occured",
            error: err
          })
        })
      }
    })
  } catch {
    res.status(500).send("Failed")
  }
})

app.post('/users/login', async (req, res) => {
  var username = req.body.username
  var password = req.body.password
  
  User.findOne({$or : [{mobile: username}, {email: username}]}).then((getUser) => {
    if(getUser) {
      bcrypt.compare(password, getUser.password, function(err, result){
        if(err) {
          res.json({
            error:err
          })
        }
        if(result){
          let token = jwt.sign({name : getUser.name}, keys.jwtSecret.key, {expiresIn: '1h'})
          res.json({
            message:"user Login successfuly",
            result:getUser,
            token
          })
        }
        else{
          res.json({
            message:"Password does not matched!"
          })
        }
      })
    }
    else{
      res.json({
        message: "No user found"
      })
    }
  })
})

// app.listen(3000)
app.listen("3000", () => {
  console.log("Server is running!");
});