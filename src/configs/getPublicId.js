module.exports = (url) => {

    const pattern = /\/v\d+\/(.+)\.[a-z]+$/;
    const match = url.match(pattern)
    console.log(match)
    return match[1]
}
//ตัดหลังไฟล์ 1728307525/1728307524358_827.3168609627712
// https://res.cloudinary.com/dvrgra6z8/image/upload/v1728307525/1728307524358_827.3168609627712.jpg
//ใช้ในการลบไฟล์เป็นต้น