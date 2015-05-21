
// First time page is loaded 
$(document).on("pageinit","#page_show_user_profile",function(){
	var userIDtoShow = localStorage.getItem("userIDtoShow");
	//console.log("pageinit - userIDtoShow: "+userIDtoShow);

	$('a[name=show_user_donationlist]').click(function(){
		console.log("Viser +"+localStorage.getItem("userIDtoShow")+" sine donasjoner");
	});

	$('button[name=challenge_user]').click(function(){
		var userIDtoShow = localStorage.getItem("userIDtoShow");
		console.log("challenge: "+localStorage.getItem("userIDtoShow"));
	});
	
}); // on pageinit

// Everytime page is shown
$(document).on("pagebeforeshow","#page_show_user_profile",function(){
	var userIDtoShow = localStorage.getItem("userIDtoShow");
	$('a[name=show_user_donationlist]').attr("href","#page_show_user_profile");

	// get user's privacy settings
	var sql = "select * from privacy where userID like '"+userIDtoShow+"'";
	var privacy_page, privacy_donations, weAreFriends=false;
		$.ajax({
			type:"post",
			url :getURLappBackend(),
			dataType:"json",
			data:{"getSQL":sql},
			success:function(response){
				if (response.length == 0){
					// User has yet to customize privacysettings, using defaults: visibility to friends
					privacy_page=1;
					privacy_donations=1;
				}
				else{
					privacy_page = response[0].page;
					privacy_donations = response[0].donations;
				}
				if(privacy_page == 0){
					showMessage("Access denied");
					window.history.go(-1);
					return;
				}else if (privacy_page == 1){
					sql = "select * from friend where userEmail like '"+localStorage.getItem("userID")+"' and friendEmail like '"+userIDtoShow+"'";
					console.log(sql);
					$.ajax({
						type:"post",
						url :getURLappBackend(),
						dataType:"json",
						data:{"getSQL":sql},
						success:function(response){
							if(response.length == 0){
								// Not friends
								showMessage("Access denied");
								window.history.go(-1);
								return;
							}else{
								weAreFriends = true;
							}
							if(privacy_donations == 2 || (privacy_donations == 1 && weAreFriends)){
								$('a[name=show_user_donationlist]').attr("href","#page_showUserDonations");
								getUserDonationInformation(userIDtoShow);
							}else{
								denyUserDonationInfo(userIDtoShow);
							}
							
						}
					});
				}else {
					// privacy_page == 2
					sql = "select * from friend where userEmail like '"+localStorage.getItem("userID")+"' and friendEmail like '"+userIDtoShow+"'";
					console.log(sql);
					$.ajax({
						type:"post",
						url :getURLappBackend(),
						dataType:"json",
						data:{"getSQL":sql},
						success:function(response){
							if(response.length == 0){
								// Not friends
							}else{
								weAreFriends = true;
							}
							if(privacy_donations == 2 || (privacy_donations == 1 && weAreFriends)){
								getUserDonationInformation(userIDtoShow);
								$('a[name=show_user_donationlist]').attr("href","#page_showUserDonations");
							}else{
								denyUserDonationInfo(userIDtoShow);
							}

						}
					});
				}

			}
		});


	//console.log("pagebeforeshow - userIDtoShow: "+userIDtoShow);

	var url = getURLappBackend();
	var sql = "SELECT * FROM user WHERE email = '"+userIDtoShow+"'";
	var data = {"getSQL" : sql};

	$.ajax({
		type : "POST",
		url : url,
		data : data,
		dataType : "JSON",
		success : function(json){
			if(json.length == 1){
				$('p[name=show_profile_username]').text(json[0].email);
				localStorage.setItem("userIDtoShow",json[0].email);

				var picURL = json[0].picURL;
				picURL = (picURL == null ? "../img/no_image_avaliable.png" : picURL);
				$('img[name=user_logo]').attr("src",picURL);
				$('span[name=show_user_fullname]').text(json[0].name);
				localStorage.setItem("userToShowName",json[0].name);
				

				
			}
		},
		error : function(){
			alert("showUserprofile.js Her gikk noe galt");
		}
	}); // ajax
}); // on pagebeforeshow

function denyUserDonationInfo(userIDtoShow){
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
	$('span[name=show_user_amount_current_month]').text("X");
	$('span[name=show_user_total_amount]').text("Y");
	$('span[name=current_month]').text(current_month);
	$('span[name=show_user_num_donations]').html("Ingen");
	$('span[name=is_pluar]').html("Tilgang");
}

function getUserDonationInformation(userIDtoShow){
	var sql = "SELECT * FROM Donation WHERE email = '"+userIDtoShow+"'";
	var url = getURLappBackend();
	var data = {"getSQL" : sql};

	$.ajax({
		type : "POST",
		url : url,
		data : data,
		dataType : "JSON",
		success : function(json){
			var num_donations = 0;
			var sum_current_month = 0;
			var current_month="";
			var sum_total = 0;

			for(var i = 0; i < json.length; i++){
				var t = json[i].date.split(/[- :]/);
				var date = new Date(t[0], t[1]-1, t[2], t[3], t[4], t[5]);

				if(date.getMonth() == new Date().getMonth()){
					
					sum_current_month += parseInt(json[i].sum);
				}num_donations++;
				sum_total += parseInt(json[i].sum);
			}
			
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

			$('span[name=show_user_amount_current_month]').text(sum_current_month);
			$('span[name=show_user_total_amount]').text(sum_total);
			$('span[name=current_month]').text(current_month);
			$('span[name=show_user_num_donations]').html(num_donations==0?"Ingen":num_donations);
			$('span[name=is_pluar]').html(num_donations==1?"donasjon":"donasjoner");
			
		},// success
		error : function(error){
			alert("Error i showUserprofile.js getUserDonationInformation(userID)");
		}
	}); // ajax
} // getUserDonationInformation(userIDtoShow)

$(document).on("pagebeforeshow","#page_showUserDonations",function(){
	// alert("page_showUserDonations");
	var userIDtoShow = localStorage.getItem("userIDtoShow");
	listUserDonations(userIDtoShow);

	$(document).off("click").on("click","#userDonationList .li_mid",function(){
		//console.log("userDonation,projectID: "+$(this).closest("li").attr("projectID"));
		localStorage.setItem("projectToShow", $(this).closest("li").attr("projectID"));
		$.mobile.changePage("#page_project",{"transition":"slideup"});
	});
});

function listUserDonations(userIDtoShow){
	//alert("nå kommer\n"+userIDtoShow+"\nsine donasjoner");
	var usernameToShow = localStorage.getItem("userToShowName");
	var firstname = usernameToShow.substring(0,usernameToShow.indexOf(" "));
	$("#usernameToShow").html(firstname+"'s donasjoner");

	
	var list = $("#userDonationList");
	//var sql = "select project.projectID as projectID, project.name as name, donation.sum as sum, donation.type as type, donation.active as active, donation.date as date from donation join project on (project.projectID = donation.projectID) where donation.email like '"+userIDtoShow+"'";
	var sql ="SELECT d.*, p.name as projectName, p.logoURL as logoURL FROM donation as d join project as p on (p.projectID = d.projectID ) "
			+"WHERE email = '"+userIDtoShow+"' order by date desc";
	var url = getURLappBackend();
	var data = {"getSQL" : sql};

	$.ajax({
		type: "post",
		url: url,
		dataType: "json",
		data: data,
		success:function(json){
			var listHTML="";
			var listItem="";
			if(json.length == 0){
				listItem = 	"<li>"+usernameToShow+" har ikke donert ennå </li>";
				listHTML = listItem;
				list.html(listHTML);
			}else{
				
				for(var i = 0; i < json.length; i++){
					var img = json[i].logoURL;
					var imgHTML ="";
					if (img != null)
						imgHTML = '<img src="'+img+'">';

					listItem =
						'<li projectID="' + json[i].projectID +'"  donation="' + json[i].donationID +'" active="'+
							(json[i].active == 1 ? 'true">':'false">')+
							'<div class="li_container">' +
								//'<div class="li_left"><div class="donationItem">'+(i+1)+'</div></div>'+
								'<div class="li_left"><div class="circlegrey">'+imgHTML+'</div></div>'+
								'<div class="li_mid">'+
									'<div class="li_project large">' + json[i].projectName + '</div>'+
									'<span class="li_donation grey">' + json[i].sum + ' kr</span> <span'+
									(json[i].type == 'fast'?' class="green">fast':'>')+'</span><span  class="grey x-small right" style="line-height:15pt">'+
									//formatDate(json[i].date)+
									calcTime(json[i].date)+
									' siden</span>'+
								'</div>'+
								'<div class="li_right">'+
									((json[i].type == 'fast' ? (json[i].active == 1 ? '<img src="../img/ongoing.png" class="icon">':'<img src="../img/cancelled.png" class="icon">') : '' ))+
								'</div>'+
							'</div>'+
						'</li>';
				
					listHTML+=listItem;
						
				}
				list.html(listHTML);
			}

		},
		error:function(response){
			alert("error: "+JSON.stringify(response.readyState));
		}
	});
}