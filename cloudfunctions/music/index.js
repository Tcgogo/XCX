// 云函数入口文件
const cloud = require('wx-server-sdk')

const TcbRouter = require("tcb-router")

const axios = require('axios')

const BASE_URL = 'http://zmap.club:3000'

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({
    event
  });

  app.router('playlist', async(ctx, next) => {
    ctx.body = await cloud.database().collection('playlist')
      .skip(event.start)
      .limit(event.count)
      .orderBy('createTime', 'desc')
      .get()
      .then((res) => res)
  })

  app.router('musiclist', async(ctx, next) => {
    let musiclist = await axios.get(`${BASE_URL}/playlist/detail?id=${parseInt(event.playlistId)}`)
    ctx.body = musiclist.data
  })
  
  return app.serve()
}