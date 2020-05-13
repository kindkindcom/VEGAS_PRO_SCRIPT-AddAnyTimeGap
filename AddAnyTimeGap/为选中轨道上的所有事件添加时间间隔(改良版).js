/** 
 * Program:     Add2SecondGap.js
 * Description: This script will add a 2 second gap required for CD audio tracks.
 *              Note: You should have ripple edit OFF before using this script.
 *
 * Author: Johnny (Roy) Rofrano  john_rofrano@hotmail.com
 * 
 * Date: March 24, 2004
 *
 **/
/**
 * kindkind 改良版 2020/04/18, 上面保留作者原信息
 * 原脚本比较简单，但是运行会出现事件错位的情况，
 * 改良版尝试了多种方式，最终摸索出一个较为可行的方案，
 * 并且增加了设置窗口便于使用。
 ！ 免费共享脚本，尊重原作者，
 ！ 请勿用于商业用途、变相销售等途径。
 **/ 

import System;
import System.Collections;
import System.Text;
import System.IO;
import System.Drawing;
import ScriptPortal.Vegas; 
import System.Windows.Forms;


try
{



	var twoSecondGap : Timecode = new Timecode("00:00:02.00");

	var dlog = new UserDialog();
	//msg(dlog.viewLabel);
	if (DialogResult.OK == dlog.ShowDialog()) 
	{
		var t : Timecode = new Timecode(dlog.inputBox.Text);
		eventAddTime(t);
	} else {
		//msg(dlog.inputBox.Text);
		dlog.Close();
	}
	
	
	class UserDialog extends Form {
		//声明外部可访问对象
		var inputBox : TextBox;
		var viewLabel : Label;

		function UserDialog() {
			this.Text = "增加事件间隔时间 - kindkind 改良版";
			this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedDialog;
			this.MaximizeBox = false;
			this.StartPosition = FormStartPosition.CenterScreen;
			this.Width = 400;
			this.BackColor = Color.FromArgb(45,45,45);
			this.ForeColor = Color.FromArgb(200,200,200);

			var titleBarHeight = this.Height - this.ClientSize.Height;
			var titleBarWidth = this.ClientSize.Width/2;
			var buttonWidth = 80;
			
			
			inputBox = addTextControl("输入时间", int(titleBarWidth/3), this.ClientSize.Width-titleBarWidth-2, 20, twoSecondGap);
			
			
			var titleLabel = new Label();
			titleLabel.AutoSize = true;
			titleLabel.Text = "间隔(时:分:秒.帧):";
			titleLabel.Left = Controls.Item("label").Left;
			titleLabel.Top = inputBox.Top + inputBox.Height+10;
			Controls.Add(titleLabel);
			
			
			viewLabel = new Label();
			viewLabel.AutoSize = true;
			viewLabel.Text = this.inputBox.Text;
			viewLabel.Left = titleLabel.Left + titleLabel.Width;
			viewLabel.Top = titleLabel.Top;
			//viewLabel.Name = "viewLabel";
			Controls.Add(viewLabel);
			
			var aboutLabel = new Label();
			aboutLabel.AutoSize = true;
			aboutLabel.Text = "KindKind 改良版, 2020/04";
			aboutLabel.ForeColor = System.Drawing.Color.Gray;
			aboutLabel.Left = 10;
			aboutLabel.Top = int(this.ClientSize.Height/2.8);
			Controls.Add(aboutLabel);

			
			var buttonTop = this.viewLabel.Bottom + 16;
			var cancelButton = new Button();
			cancelButton.Text = "取消";
			cancelButton.Left = this.Width - buttonWidth*1.3;
			cancelButton.Top = buttonTop;
			cancelButton.Width = buttonWidth;
			cancelButton.Height = cancelButton.Font.Height + 12;
			cancelButton.DialogResult = System.Windows.Forms.DialogResult.Cancel;
			CancelButton = cancelButton;
			Controls.Add(cancelButton);

			
			var okButton = new Button();
			okButton.Text = "确定";
			okButton.Left = cancelButton.Left - buttonWidth-10;
			okButton.Top = cancelButton.Top;
			okButton.Width = buttonWidth;
			okButton.Height = okButton.Font.Height + 12;
			okButton.DialogResult = System.Windows.Forms.DialogResult.OK;
			AcceptButton = okButton;
			Controls.Add(okButton);


			this.Height = titleBarHeight + okButton.Bottom + 8;

		}
		
		function addTextControl(labelName, left, width, top, defaultValue) {
			var label = new Label();
			label.AutoSize = true;
			label.Text = labelName + ":";
			label.Left = left;
			label.Top = top + 4;
			label.Name = "label";
			Controls.Add(label);
			
			var textbox = new inputText(this.GetContainerControl());
			textbox.Multiline = false;
			textbox.Left = label.Right;
			textbox.Top = top;
			textbox.Width = width - (label.Width);
			textbox.Text = defaultValue;
			Controls.Add(textbox);
			
			return textbox;
		}
		
		//viewLabel.Click = new System.EventHandler(this.viewLabel_Click);
		function viewLabel_Click(e:EventArgs){
			MessageBox.Show(this.Text);
		}
	}
	
	// inputBox
	class inputText extends TextBox {
		var _parent = null;
		function inputText(parent){
			_parent = parent;
		}

		//GetContainerControl() 父级

		protected override function OnTextChanged(e:EventArgs){
			super.OnTextChanged(e);
			//msg(e);
			//var vl : Label = ;
			if (this._parent.viewLabel){
				this._parent.viewLabel.Text = new Timecode(this.Text);
			}
			
			//this._parent.viewLabel.Text = this.Text;
		}

	}



	function eventAddTime(inTimeCode : Timecode)
	{
		for (var track in Vegas.Project.Tracks) 
		{
			if(!track.Selected) continue;

			var tracktime : Timecode = inTimeCode;

			var tcount:int = track.Events.Count-1; //获取轨道事件总数，-1可以让最头上的事件不移动
			var tc : Timecode = new Timecode(); //1000=1秒，50=1帧，但是使用变量不知为啥就是1=1秒

			for (var i=0; i<tcount; i++)
			{
				tc += tracktime; //笨办法计算时间码的倍数
			}
			//msg(tc)
			
			for (var i=tcount; i>0; i--) //倒着控制事件的位置，避免顺序情况下事件顺序错乱的问题
			{
				var ev = track.Events[i];
				//msg(ev.Start + " = " + ev.Length);
				ev.Start += tc;
				//msg(ev.Start + " = " + ev.Length);
				tc -= tracktime;
			}

		}
	
	}


/*  以下是原作者的代码，会出现事件错位的情况，出于尊重原创予以保留
	// step through all selected video events:
	for (var track in Vegas.Project.Tracks) 
	{
		if( !track.Selected) continue;
		var tracktime = twoSecondGap;
		for (var evnt in track.Events) 
		{
			evnt.AdjustStartLength(tracktime, evnt.Length, true);
			tracktime = tracktime + evnt.Length + twoSecondGap;
		}
	}
*/




}
catch (errorMsg)
{
	MessageBox.Show(errorMsg, "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
}


function msg(m){
	MessageBox.Show(m);
}