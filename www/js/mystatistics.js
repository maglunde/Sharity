
	$( document ).delegate("#page_mystatsDonations", "pageinit", function() {
		listDonations();
	});
	
	$( document ).delegate("#page_mystatistics", "pageinit", function() {
		showStats();
	});
	

	$(".back_btn").click(function() {
		window.history.go(-1);
	});

	$(".footer_me").click(function() {

		showStats();
	});
	function showStats(){
		var current_date = new Date();
		var month = new Array();
		month[0] = "Januar";
		month[1] = "Februar";
		month[2] = "Mars";
		month[3] = "April";
		month[4] = "Mai";
		month[5] = "Juni";
		month[6] = "Juli";
		month[7] = "August";
		month[8] = "September";
		month[9] = "Oktober";
		month[10] = "November";
		month[11] = "Desember";

		var current_month = month[current_date.getMonth()];

		$('span[name=current_month]').text(current_month);

		var email = localStorage.getItem('userID');
		var sql = "SELECT * FROM User WHERE email = '"+email+"'";
		var url = getURLappBackend();
		var data = {"getSQL" : sql};

		$.ajax({
			type : "POST",
			url : url,
			data : data,
			dataType : "JSON",
			success : function(json){
				$('div[name="user_name"]').text(json[0].name);
				$('img[name=logo]').attr('src',json[0].picURL);
				getDonationInformation();
				getChallenges();

			},
			error : function(error){
				alert("Error i mystatistics.js bad ajax reqest getSQL from database");
			}
		});


		$('div[name="user_name"]').text('Full name goes here');
		
	}




function getChallenges(){
	var email = localStorage.getItem('userID');
	var sql = "SELECT * FROM challenge WHERE to_user = '"+email+"'";
	var url = getURLappBackend();
	var data = {"getSQL" : sql};

	$.ajax({
		type : "POST",
		url : url,
		data : data,
		dataType : "JSON",
		success : function(json){
			$('#mystats_num_challenges').text(json.length);
		},
		error : function(error){
			alert("Error i mystatistics.js bad ajax reqest getSQL from database");
		}
	});
}


function getDonationInformation(){
	var email = localStorage.getItem('userID');
	var sql = "SELECT * FROM Donation WHERE email = '"+email+"'";
	var url = getURLappBackend();
	var data = {"getSQL" : sql};

	$.ajax({
		type : "POST",
		url : url,
		data : data,
		dataType : "JSON",
		success : function(json){

			var text = "";

			var num_donations = 0;
			var sum_current_month = 0;
			var sum_total = 0;

			for(var i = 0; i < json.length; i++){
				text += "Sum: " + json[i].sum + ", Type: " + json[i].type + ", Datum: "+ json[i].date  + "\n";

				var t = json[i].date.split(/[- :]/);
				var date = new Date(t[0], t[1]-1, t[2], t[3], t[4], t[5]);

				if(date.getMonth() == new Date().getMonth()){
					num_donations++;
					sum_current_month += parseInt(json[i].sum);
				}
				sum_total += parseInt(json[i].sum);
			}

			//alert("File: mystatistics.js getDonationInformation() just for show:\n" + text);


			
			$('span[name=amount_current_month]').text(sum_current_month);
			$('span[name=total_amount]').text(sum_total);
			if(num_donations == 1){
				$('span[name=is_pluar]').text("Donasjon");
			}else{
				$('span[name=is_pluar]').text("Donasjoner");
			}
			if(num_donations == 0){
				$('span[name=num_donations]').text("Ingen");
				$('span[name=is_pluar]').text("donasjoner");
			}else{
				$('span[name=num_donations]').text(num_donations);
			}
			
			return json;
			//alert(text);
		},
		error : function(error){
			alert("Error i mystatistics.js bad ajax reqest getSQL from database");
		}
	});
}

function listDonations(){
	var email = localStorage.getItem('userID');
		var sql = "SELECT * FROM Donation WHERE email = '"+email+"'";
		var sql ="SELECT don.*, pro.name as projectName FROM donation as don join project as pro on (pro.projectID = don.projectID ) WHERE email = '"+email+"'";
		var url = getURLappBackend();
		var data = {"getSQL" : sql};

		$.ajax({
			type : "POST",
			url : url,
			data : data,
			dataType : "JSON",
			success : function(json){

				var donations = "";

				var num_donations = 0;
				var sum_current_month = 0;
				var sum_total = 0;

				for(var i = 0; i < json.length; i++){

					donations +='<li id="' + json[i].projectID +'"  donation="' + json[i].donationID +'" active="'+
						(json[i].active == 1 ? 'true">':'false">')+
						'<div class="li_container">' +
						'<div class="li_left">'+
						'<div class="li_circ"></div>'+
						'</div>'+
						'<div class="li_mid">'+
						'<div class="li_project">' + json[i].projectName + '</div>'+
						'<span class="li_donation grey">' + json[i].sum + ' kr,</span> <span'+
						(json[i].type == 'fast'?' class="green">':'>')+json[i].type+'</span>'+
						'</div>'+
						'<div class="li_right">'+
						//(json[i].type == 'fast'?'<img src="donation_cancel.png"':'')+
						((json[i].type == 'fast' ? (json[i].active == 1 ? 'Aktiv':'Stoppet') : '' ))+
						'</div>'+
						'</div>'+
						'</li>';
				}
				$("#donationList").html(donations);
				$("#donationList li .li_mid, .li_left, .li_right").click(function() {
					var projectID =$(this).parent().parent().attr("id");
					var donationID =$(this).parent().parent().attr("donation");
					var active = $(this).parent().parent().attr("active");

					if($(this).attr("class") == "li_right"){
						if(active == "true"){
							if (confirm("Stoppe donasjonen?") == true) {
							stopDonation(donationID);
							}else{
								exit;
							}	
						}else{
							if (confirm("Aktivere donasjonen igjen?") == true) {
							startDonation(donationID);
							}else{
								exit;
							}
						}
						
								
					}
					localStorage.setItem("projectToShow", projectID);
					$.mobile.changePage("#page_project");
					location.reload();
					//alert("file: organization.js: projectList is clicked, setting projectIDto Show: " + localStorage.getItem('projectToShow'));		
				});



			},
			error : function(error){
				alert("Error i mystatistics.js bad ajax reqest getSQL from database");
			}
		});	
}

function stopDonation(donationID){
	var sql = "update donation set active = 0 where donationID = "+donationID;
	var url = getURLappBackend();

	$.ajax({
		type:"post",
		url:url,
		dataType:"text",
		data:{"setSQL":sql},
		success: function(response){
			alert("Donasjon stoppet!");
			window.location.reload();
		},
		error: function(response){
			alert("Kunne ikke stoppe donasjonen.");
		}
	});

	exit;
}

function startDonation(donationID){

	var userID, projectID,type,sum;
	var sql = "SELECT * FROM donation where donationID = "+donationID;
	var url = getURLappBackend();

	$.ajax({
		type: "POST",
		url: url,
		dataType: "json",
		data: {"getSQL":sql},
		success: function(r){
			userID = r[0].email;
			projectID = r[0].projectID;
			type = r[0].type;
			sum = r[0].sum;
			
			var txt = r[0].donationID +", "+r[0].projectID  +", "+r[0].email+", "+r[0].type +", "+r[0].sum +", "+r[0].active;
			//alert(txt);

			sql = "UPDATE donation set active = 1 where donationID = "+donationID;

			$.ajax({
				type :"POST",
				url : url,
				dataType : "text",
				data : {'setSQL' : sql},
				success : function(response){
					alert("Donasjon aktivert!")
					window.location.reload();

				},
				error : function(response){
					alert("Error in setSQL:"+ response);
				}
			});
		},
		error: function(response){
			alert("error in getSQL:"+json.stringify(response));
		}

	});

	exit;

}