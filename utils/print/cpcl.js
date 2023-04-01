var jpPrinter = {
　　　　createNew: function(){
　　　　　　var jpPrinter = {};
			var data = "";
			jpPrinter.name = "蓝牙打印机";
			
			jpPrinter.init = function(){				
			};


      //设置页面大小
      jpPrinter.GPSetPage = function (pageWidght,pageHeight) {
        data += "SIZE " + pageWidght.toString() + " mm" + "," + pageHeight.toString() +" mm"+"\n";
      };
      //设置打印机速度
      jpPrinter.GPspeed = function (printSpeed) {
        data += "SPEED " + printSpeed.toString() + "\n";
      };
      //设置打印机浓度
      jpPrinter.GPdensity = function (printDensity) {
        data += "DENSITY " + printDensity.toString() + "\n";
      };
      //传感器
      jpPrinter.GPGap = function (printGap) {
        data += "GAP " + printGap.toString()+" mm " +","+ "0" +"\n";
      };
      //清除打印机缓存
      jpPrinter.GPcls = function() {
        data += "CLS" + "\n";
      };      
      //打印字母
     // jpPrinter.GPText = function (x,y,str) {
    //    data += "TEXT" + x.toString() + y.toString() + "5" + "0" + "1" + "1" + str+"\n";
    //  };
      //打印文字
    //  jpPrinter.GPTextWord= function (x, y, str1) {
   //     data += "TEXT" + x + y + "TSS24.BF2" + "0" + "1" + "1" + str1+ "\n";
    //  };
      //打印页面
      jpPrinter.GPPagePrint = function () {
        data += "PRINT 1,1\n";
      };	

      jpPrinter.GPSendcommand = function (str) {
        data += str;
      };	

     
















			
			/*复位打印机*/
			jpPrinter.resetPrinter = function(){ 
				data += "\x1B\x40";
			};	
			
			/*设置对齐方式*/
			jpPrinter.escSetAlign = function(align){ 
				if (align == 0)
					data += "\x1B\x61\x00";
				else if (align == 1)
					data += "\x1B\x61\x01";
				else 
					data += "\x1B\x61\x02";
			};	
			
			//获取打印数据
		 	jpPrinter.getData = function(){
				return data;
			};
			
			//设置页面大小
			jpPrinter.cpclSetPage = function(pageHeight){ 
				data += "! 0 200 200 " + pageHeight.toString() + " " + "1\r\n";	
			};	 
			
      //走纸
      jpPrinter.cpclPageFeed = function () {
        data += "FORM\r\n";
      };

			//打印页面
		 	jpPrinter.cpclPagePrint = function(){
				data +=  "PRINT\r\n";
			};		
			
			//打印文本
			jpPrinter.cpclText = function(x, y, textStr, fontFamily, fontSize){
				data += "TEXT " + fontFamily.toString() + " " + fontSize.toString() + " " + x.toString() + " " + y.toString() + " " + textStr + "\r\n";
			};

      //打印竖排文本
      jpPrinter.cpclV90Text = function (x, y, textStr, fontFamily, fontSize) {
        data += "VTEXT " + fontFamily.toString() + " " + fontSize.toString() + " " + x.toString() + " " + y.toString() + " " + textStr + "\r\n";
      };

      //打印二维码
      jpPrinter.cpclQRCode = function (x, y, unit_width, textStr) {
        data += "BARCODE QR " + x + " " + y + " " + "M 2 " + "U 3 " + unit_width + "\r\nMA," + textStr + "\r\nENDQR\r\n";
      };
			
			//设置文本的加粗效果
			jpPrinter.cpclSetFontBold = function(bold){
				data += "SETBOLD " + bold + "\r\n";        
			};		
    
			//设置字体倍高倍宽
			//取值范围1~16
			jpPrinter.cpclSetFontMag = function(doubleWidth, doubleHeight){
				data += "SETMAG " + doubleWidth + " " + doubleHeight + "\r\n";        
			};
			
			//设置对齐方式
			//取值范围0~2 0:left 1 center 2 right
			jpPrinter.cpclSetAlign = function(alignValue){
				if (alignValue == 0)
					data += "LEFT\r\n";  
				else if (alignValue == 1)
					data += "CENTER\r\n";  
				else
					data += "RIGHT\r\n";  				
			};
			
			//设置反白线段
			jpPrinter.cpclLineInverse = function(x0, y0, x1, y1, width){
				data += "IL " + x0 + " " + y0 + " " + x1 + " " + y1 + " " + width + " " + "\r\n";   				
			};
			
			//设置线段
			jpPrinter.cpclLine = function(x0, y0, x1, y1, width){
				data += "L " + x0 + " " + y0 + " " + x1 + " " + y1 + " " + width + " " + "\r\n";   				
			};
			
			//设置一维码
			jpPrinter.cpclBarcodeCode128 = function(x, y, unit_width, bar_height,  textStr){
				var radio1 = 2;
				data += "BARCODE 128 " + unit_width + " " + radio1 + " " + bar_height + " " + x + " " + y + " " + textStr + "\r\n";
			};
			
			//设置文本区域
			jpPrinter.cpclTextareaStart = function(x, y, width, height){
				data += "TA START " + x + " " + y + " " + width + " " + height + "\r\n";   				
			};
			
			//文本区域文字
			jpPrinter.cpclTextareaText = function(textStr){
				data += "TA TEXT " + textStr + "\r\n";   				
			};
			
			//文本区域文字加粗效果
			jpPrinter.cpclTextareaCharBold = function(bold){
				data += "TA BOLD " + bold + "\r\n";   				
			};
			
			//文本区域字体设置
			jpPrinter.cpclTextareaFont = function(fontHeight){
				data += "TA FONT " + fontHeight + "\r\n";   				
			};


      //绘制矩形框
      jpPrinter.cpclBox = function (x0, y0, x1, y1, width){
        data += "BOX " + x0 + " " + y0 + " " + x1 + " " + y1 + " " + width + " " + "\r\n";
      };
			
			//文本区域行间距设置
			jpPrinter.cpclTextareaLineSpace = function(space){
				data += "TA LINESPACE " + space + "\r\n";   				
			};
			
			//文本区域字符间距设置
			jpPrinter.cpclTextareaCharSpace = function(space){
				data += "TA CHARSPACE " + space + "\r\n";   				
			};

      //打印图片
      jpPrinter.cpclPicture = function (x, y, image_width, image_height, image) {
        data += "EG " + image_width + " " + image_height + " " + x + " " + y + " " + image + "\r\n";
      };

　　　　　　return jpPrinter;
　　　　}
　　};

module.exports.jpPrinter = jpPrinter;

