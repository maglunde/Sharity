$(document).ready(function(){

	if(localStorage.getItem('userID') != null){


		
		
		var sql = "select name, sum(donation.sum) as Donasjoner from user join friend  on (user.email like friend.email2 and friend.email like '"+localStorage.getItem('userID')+"') left join donation on(donation.email like friend.email2) group by name";

		var url = getURLappBackend();


		$.ajax({
			type : "POST",
			url : url,
			dataType: "json",
			data : {'getSQL' : sql},
			success : function(response){
				
				$("#debug").append(response);

				for(var i = 0 ; i < response.length; i++){		
					
					var friend='<li><a href="friend.html" rel="external" class="show-page-loading-msg">'
					+'<div class="li_container">'
					+'<div class="li_left">'
					+'<div class="circle">'
					+'<p>Bilde</p>'
					+'</div>'
					+'</div>'
					+'<div class="li_mid_left dots">'
					+'<span class="li_friends">'+response[i].name	+'</span>	'	
					+'</div>'
					+'<div class="li_mid_right donations">'
					+'<span class="li_donations green">'
					+(response[i].Donasjoner==null?0:response[i].Donasjoner+'')
					+'</span>'
					+'</div>'
					+'<div class="li_right">'
					+'<img src="../img/li_arrow_r_grey.png">'
					+'</div>'
					+'</div>'
					+'</a>'
					+'</li>';
					$("#friendList").append(friend);
				}
			},
			error: function(){
				alert("getOrganiation.js error");
			}
		});
	}
});