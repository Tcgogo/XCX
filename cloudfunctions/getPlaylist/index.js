// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()

const axios = require('axios')

const URL = 'http://zmap.club:3000/personalized'

const playlistCollection = db.collection('playlist')

const MAX_LIMIT = 100


// 云函数入口函数
exports.main = async (event, context) => {
  //获取云数据库中的数据
  const countResult = await playlistCollection.count()
  const total = countResult.total
  const batchTimes = Math.ceil(total / MAX_LIMIT)
  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    let promise = playlistCollection.skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
    tasks.push(promise)
  }

  let list = {
    data: []
  }
  if (tasks.length > 0) {
    list = (await Promise.all(tasks)).reduce((acc, cur) => {
      return {
        data: acc.data.concat(cur.data)
      }
    })
  }


  const { data } = await axios.get(URL)

  const playlist = data.result

  const resData = []
  for (let outItem of playlist) {
    let flag = true
    for (let inItem of list.data) {
      if (outItem.id === inItem.id) {
        flag = false
        break
      }
    }
    if(flag) {
      resData.push(outItem)
    }
  }

  console.log(list.data)
  if (resData.length > 0) {
    await playlistCollection.add({
      data: [...resData]
    }).then(() => {
      console.log('插入成功')
    }).catch(() => {
      console.log('插入失败')
    })
  }
}