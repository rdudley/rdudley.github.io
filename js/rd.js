$(document).ready(function() {	

	////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////  VARIABLE DECLARATIONS
	////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	var siteImages = {};
	var imagesArray = [];
	var signatureImage = 0;
	var menuOpen = false;
	
	var cdnURL = "http://df6e3d9e215151e9db04-92d3187c68fe2dd6746e629ea0a7afef.r35.cf1.rackcdn.com/";

	////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////  NAVIGATION
	////////////////////////////////////////////////////////////////////////////////////////////////////////

	$("#nav-about-marker, #nav-work-marker, #nav-photos-marker, #nav-contact-marker").fadeTo(0, .25);
	
	$("#nav a").hover(function() { 
			var bottomdiv = "#nav-" + $(this).text().toLowerCase() + "-marker";
			$(bottomdiv).animate({ height: "10px" }, 200).fadeTo(250, 1);
		}, function() {
			var bottomdiv = "#nav-" + $(this).text().toLowerCase() + "-marker";
			$(bottomdiv).animate({ height: "5px" }, 200).fadeTo(250, .25);
	});

	$("#nav a, #jumpmenu a").click(function(event) {
		event.preventDefault();
		
		$('html, body').stop().animate({
            scrollTop: $($(this).attr('href')).offset().top
        }, 1000,'easeInOutExpo');
		var section = $(this).attr('href');
		ga('send', 'event', 'nav', 'click', section);
	});
		
	$('#jumpmenu-button').click(function() {
		if (menuOpen) {
			menuOpen = false;
			$('#jumpmenu').fadeOut("fast");
			$('#jumpmenu-button').css('background-color', 'rgba(0, 0, 0, 0.3)');
		}
		else if (menuOpen == false) {
			menuOpen = true;
			$('#jumpmenu').fadeIn("fast");
			$('#jumpmenu-button').css('background-color', 'rgba(0, 0, 0, 0.75)');
		}
		
	});
	
	$("#jumpmenu a").click(function(event) {
		menuOpen = false;
		$('#jumpmenu-button').css('background-color', 'rgba(0, 0, 0, 0.3)');
		$('#jumpmenu').fadeOut("fast");
		event.preventDefault();
	});
	
	function updateJumpMenu() {
    	var pos = ($(document).width() - $("#wrapper").width())/2 + 10;
		$("#jumpmenu-button").css("right", pos);
		$("#jumpmenu").css("right", pos);
	}
	
	// Window events for jumpmenu
	$(window).scroll(function() {
		updateJumpMenu();
		if ($(window).scrollTop() > 100) {
			$('#jumpmenu-button').fadeIn();
			$('#jumpmenu').fadeOut("fast");
		} else {
			$('#jumpmenu-button').fadeOut();
		}
	});
	
	$(window).resize(function() {
        $('#jumpmenu-button').fadeOut("fast").css('background-color', 'rgba(0, 0, 0, 0.3)');
		$("#jumpmenu").fadeOut("fast");
		menuOpen = false;
		
		if(this.resizeTO) clearTimeout(this.resizeTO);
        this.resizeTO = setTimeout(function() {
            $(this).trigger('resizeEnd');
        }, 500);			
	});
	
	$(window).bind('resizeEnd', function() {
		updateJumpMenu();
		
		if ($(window).scrollTop() > 100) {
			$("#jumpmenu-button").fadeIn("fast");	
		}
	});

	////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////  SIGNATURE IMAGE
	////////////////////////////////////////////////////////////////////////////////////////////////////////

	function prepSignatureImage() {
		$.ajax({
   			type: "GET",
   			url: "images.json",
   			dataType: "json",
   			async: false,
   			beforeSend : function() {
   				$("#signature-image img").attr("src", "images/blank.png");
   			},
  			success: function(data){				
  				signatureImage = Math.floor(Math.random() * data.image.length);

				siteImages = data;
				
				$("#signature-image img").attr("src", "images/" + siteImages.image[signatureImage].source);
				$("#image-description").text(siteImages.image[signatureImage].description);
				//$("#image-description").css(siteImages.image[signatureImage].color);

				showSignatureImage();
				prepPhotos();	
   			}
 		});
	}

	function showSignatureImage() {
		$("#signature-image").delay(1000).fadeTo(1500,1);
		$("#image-description").delay(2000).fadeTo(500,1);
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////  WORK
	////////////////////////////////////////////////////////////////////////////////////////////////////////
	var active_project = "";
		
	$("#work-selections a").click(function(event) {
		event.preventDefault();
		if ($(this).data("work") != active_project) {
			active_project = $(this).data("work");
			$("#work-container").fadeTo(100,0);
			updateWork(active_project);
			
			ga('send', 'event', 'work', 'view', active_project);
			
		} else {
			revisitWork();
		}
	});
		
	function updateWork(work) {
		work_url = "work/" + work+ ".html";
		$.ajax({
			type: 'GET',
			url: work_url,
			dataType: 'html',
			beforeSend: function() {
				$('html, body').stop().animate({
            		scrollTop: $("#work").offset().top
        		}, 1000,'easeInOutExpo');
			},
			success: function(data) {
				$("#work-container").html(data).delay(500).fadeTo(500,1);
				$("#work-container img.lazy").lazyload({ effect : "fadeIn" });
			}
		});		
	}

	function revisitWork() {
		$('html, body').stop().animate({
			scrollTop: $("#work").offset().top
		}, 1000,'easeInOutExpo');	
	}	
	
	////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////  PHOTOS
	////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	function shuffleArray(array) {
  		// Do the Fisher-Yates shuffle... 
		var n = array.length, t, r;
		while (n) {
			r = Math.floor(Math.random() * n--);
			t = array[n];
			array[n] = array[r];
			array[r] = t;
  		}
		return array;
	}
	
	function prepPhotos() {
		for (i = 0; i < siteImages.image.length; i++) {
			imagesArray.push(i);	
		}
		
		shuffleArray(imagesArray);
		
		$("#photos-wrapper").append("<ul>");
		
		$.each(imagesArray, function(i, v) {
			if (v != signatureImage) {
				var html = "<li><a href=\"" + cdnURL + "/" + siteImages.image[v].source + "\"><img width=\"180px\" height=\"180px\" class=\"lazy\" data-original=\"thumbnails/" + siteImages.image[v].source + "\" alt=\"" + siteImages.image[v].description + "\"></a></li>";
				$("#photos-wrapper").append(html);
			}
		});
		
		$("#photos-wrapper").append("</ul>");
		
		$("img.lazy").lazyload({ effect : "fadeIn" });

		$('#photos-wrapper a').imageLightbox({
			onLoadStart: function() { captionOff(); },
			onLoadEnd:	 function() { captionOn(); },
			onStart: 	 function() { overlayOn(); },
			onEnd:	 	 function() { captionOff(); overlayOff(); }
		});
	}
		
	function overlayOn() {
			$('<div id="imagelightbox-overlay"></div>').appendTo("body").fadeIn("fast");
	}
	
	function overlayOff() {
		$("#imagelightbox-overlay").fadeOut("fast", function() {
			$("#imagelightbox-overlay").remove();
		});
	}
	
	function captionOn() {
		var description = $( 'a[href="' + $( '#imagelightbox' ).attr( 'src' ) + '"] img' ).attr( 'alt' );
		if( description.length > 0 ) {
			$('<div id="caption">' + description + '</div>').appendTo('body').hide().fadeIn("slow");
			ga('send', 'event', 'photos', 'view', description); 
		}
	}
	
	function captionOff() {
		$("#caption").fadeOut("fast", function() {
			$("#caption").remove();
		});
	}
	
	////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////  CONTACT FORM
	////////////////////////////////////////////////////////////////////////////////////////////////////////	

	$("#contact-form").validate({
		submitHandler: function() {
			submitForm();
		}
	});
	
	function submitForm() {
		var form = $("#contact-form");
		
		$.ajax({
   			type: "POST",
   			url: "contact.php",
   			data: form.serialize(),
  			success: function(data){
				$("#contact-message").text(data);
				$('html, body').stop().animate({ scrollTop: $("#contact").offset().top }, 500,'easeInOutExpo');
				$("#contact-message-wrapper").delay(500).slideDown("fast").delay(8000).slideUp("fast");
				$("#contact-form").find("input[type=text], input[type=email], textarea").val("");
				
				ga('send', 'event', 'contact', 'submit'); 
   			}
 		});
	}
	
	////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////  SETUP AND GO
	////////////////////////////////////////////////////////////////////////////////////////////////////////

	$("#signature-image").fadeTo(0,0);
	$("#image-description").fadeTo(0,0);
	$("#contact-message-wrapper").hide();
	
	$('#jumpmenu-button').hide();
	$('#jumpmenu').hide();
	
	setTimeout( function() {  prepSignatureImage() }, 500);
});

	////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////  ADDITIONAL TRACKING
	////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	function trackSocial(site) {
		ga('send', 'event', 'social', 'click', site);	
	}
