import { hotelAttrsStore } from "../../store/hotelAttrsStore";

Component({
  data: {

    monthList: [],
    start: 0, //0：没选 else：选择的日期对应的index
    end: 0
  },
  lifetimes: {
    attached() {
      //用于生成三个对象 包含 year/数字 month/数字 days/天数 startIndex/一号的星期（周天是0，周一1）  dates/数组 days每个元素是对象 包含{
      // date/日期 status/选中状态，初始为0 -1：今天以前；1：入住； 2：离住 3：之间
      // } 
    
      const calendarArray = [];
      const now = new Date();
      
      let currentYear = now.getFullYear();
      let currentMonth = now.getMonth();
    
      for (let i = 0; i < 3; i++) {
        // 自动处理月份溢出，Date 对象会自动计算跨年
        const targetDate = new Date(currentYear, currentMonth + i, 1);
        const year = targetDate.getFullYear();
        const month = targetDate.getMonth() + 1; 
    
        const days = new Date(year, month, 0).getDate();
    
        // 获取该月1号是星期几 (周日为0, 周一为1...)
        const startIndex = new Date(year, month - 1, 1).getDay();
    
        // 生成 dates 数组
        const today = now.getDate()
        const dates = Array.from({ length: days }, (_, index) => ({
          date: index + 1,
          status: i === 0 && index + 1 < today ? -1 : 0
        }));
        calendarArray.push({
          year: year,
          month: month,
          days: days,
          startIndex: startIndex,
          dates: dates
        });
      }
      //根据仓库数值选中日期
      const {startDate,endDate} = hotelAttrsStore.hotelAttrs
      const{month:m1,day:d1} = this.splitDateStr(startDate)
      const{month:m2,day:d2} = this.splitDateStr(endDate)
      const start = this.getDayIndex(m1,d1,calendarArray)
      const end = this.getDayIndex(m2,d2,calendarArray)
      this.setData({
        monthList:calendarArray,
        start,
        end
      })
      this.updateStatus(start , 1) //入住
      this.updateStatus(end , 2) //离店
      for(let i = start + 1 ; i < end ; i++){
        this.updateStatus(i , 3) //中间部分
      }
    }
  },
  methods: {

    splitDateStr(dateStr) {
      if (!dateStr) return { month: 0, day: 0 };
    
      // 使用 '-' 分割字符串
      const parts = dateStr.split('-');
      return {
        month: Number(parts[1]),
        day: Number(parts[2])
      };
    },

    getDayIndex(targetMonth, targetDay, monList = '') {
      let { monthList } = this.data; 
      if( monList ){
        monthList = monList
      }
      let count = 0;
      for (let i = 0; i < monthList.length; i++) {
        const item = monthList[i];
        if (item.month === targetMonth) {
          return count + targetDay; 
        }
        count += item.days;
      }
      return count
    },

    onDateTap(e) {
    
     const {month,date} = e.currentTarget.dataset
     const nowMonth = new Date().getMonth()
     const nowDate = new Date().getDate()
     if(month===nowMonth + 1 && date < nowDate)
      return
     const { start, end } = this.data
     const index = this.getDayIndex(month,date)
      if(start && end){
        this.setData({
          start:index,
          end: 0
        })
      }else if(!start&&!end){
        this.setData({
          start:index,
          end: 0
        })
      }else if(!end){
        if(index <= start){
          this.setData({
            start:index,
            end: 0
          })
        }else{
          this.setData({
            end: index
          })
        }
      }
      //将原有选择清空
      this.updateStatus(start,0)
      this.updateStatus(end,0)
      for(let i = start + 1 ; i < end ; i++){
        this.updateStatus(i , 0) //中间部分
      }
      //设置新选择
      this.updateStatus(this.data.start , 1) //入住
      this.updateStatus(this.data.end , 2) //离店
      for(let i = this.data.start + 1 ; i < this.data.end ; i++){
        this.updateStatus(i , 3) //中间部分
      }
    },

    //更新状态
    updateStatus(index, status) {
      if(!index) return
      const { monthList } = this.data;
      let remainingIndex = index;

      for (let i = 0; i < monthList.length; i++) {
        const monthDays = monthList[i].days;

        
        if (remainingIndex <= monthDays) {
          const dayIndexInMonth = remainingIndex - 1; // 数组下标从 0 开始
          const targetPath = `monthList[${i}].dates[${dayIndexInMonth}].status`;

          this.setData({
            [targetPath]: status
          });
          return;
        }

        // 否则，减去当前月的天数，继续去下一个月找
        remainingIndex -= monthDays;
      }
    },

    //根据绝对索引得到日期格式
    getFormat(index) {
      const { monthList } = this.data
      let remainingIndex = index
    
      for (let i = 0; i < monthList.length; i++) {
        const monthItem = monthList[i]
        
        if (remainingIndex <= monthItem.days) {
          const year = monthItem.year
          const month = monthItem.month < 10 ? `0${monthItem.month}` : monthItem.month
          const day = remainingIndex < 10 ? `0${remainingIndex}` : remainingIndex
    
          return `${year}-${month}-${day}`
        }

        remainingIndex -= monthItem.days
      }
    
      return ""; // 如果超出范围返回空字符串
    },
    //关闭组件
    onClose(){
      if(this.data.end ===0 ){
        wx.toast({title:'请选择离店日期'})
        return
      }
      const startDate = this.getFormat(this.data.start)
      const endDate = this.getFormat(this.data.end)
      hotelAttrsStore.setHotelAttrs({
        startDate,
        endDate
      })
      this.triggerEvent('close')
    }

  }
});