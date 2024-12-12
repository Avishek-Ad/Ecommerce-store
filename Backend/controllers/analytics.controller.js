import User from "../models/user.model.js"
import Product from "../models/product.model.js"
import Order from "../models/order.model.js"

const getAnalytics = async(req, res) => {
    try {
        const analyticsData = await getAnalyticsData()

        const endDate = new Date()
        const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000)

        const dailySalesData = await getDailySalesData(startDate, endDate)

        res.json({
            analyticsData,
            dailySalesData
        })
    } catch (error) {
        console.log("Error in getAnalytics controller", error.message)
        res.status(500).json({message:"Server error", error:error.message})
    }
}

async function getAnalyticsData(){
    try {
        const totalUsers = await User.countDocuments()
        const totalProducts = await Product.countDocuments()

        const salesData = await Order.aggregate([
            {
                $group: {
                    _id: null, // it groups all documents together
                    totalSales: {$sum: 1},
                    rotalRevenue: {$sum: "$totalAmount"}
                }
            }
        ])

        const {totalSales, totalRevenue} = salesData[0] || {totalSales: 0, totalRevenue: 0}

        return {
            users: totalUsers,
            products: totalProducts,
            totalSales,
            totalRevenue
        }
    } catch (error) {
        throw error
    }
}

async function getDailySalesData(startDate, endDate){
    try {
        const dailySalesData = await Order.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: startDate,
                        $lte: endDate
                    }
                }
            },
            {
                $group: {
                    _id: { $dateToString: {format: "%Y-%m-%d", date: "$createdAt"} }, // it groups all documents together
                    sales: {$sum: 1},
                    revenue: {$sum: "$totalAmount"}
                }
            },
            { $sort: {_id: 1} }
        ])

        const datesArray = getDateInRange(startDate, endDate)

        return datesArray.map(date => {
            const foundDate = dailySalesData.find(item => item._id === date)
            return {
                date,
                sales: foundDate ? foundDate.sales : 0,
                revenue: foundDate ? foundDate.revenue : 0
            }
        })
    }catch(error){
        throw error
    }
}

function getDateInRange(startDate, endDate) {
    const dates = []
    let currentDate = new Date(startDate)

    while (currentDate <= endDate) {
        dates.push(currentDate.toISOString().split("T")[0])
        currentDate.setDate(currentDate.getDate() + 1)
    }
    return dates
}

export {getAnalytics}