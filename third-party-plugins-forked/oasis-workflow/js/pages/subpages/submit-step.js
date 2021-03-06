jQuery( document ).ready( function () {
   var wfpath = "";
   var stepProcess = ""; // process of selected step

   // When page is called from post edit page
   function load_setting() {
      if ( jQuery( "#hi_editable" ).val() ) {
         jQuery( ".loading" ).show();
         var check_claim = {
            action: 'check_for_claim_ajax',
            history_id: jQuery( "#hi_oasiswf_id" ).val(),
            security: jQuery( '#owf_check_claim_nonce' ).val()
         };
         jQuery.post( ajaxurl, check_claim, function ( response ) {
            if (response == -1) {
               return false; // Invalid nonce
            }
            jQuery( ".loading" ).hide();
            if ( ! response.success ) {
               jQuery( "#publishing-action ul" ).append(
                       "<li style='margin-bottom:12px;'><input type='button' id='step_submit' class='button button-primary button-large'" +
                       " value='" + owf_submit_step_vars.signOffButton + "' style='float:left;margin-top:10px;clear:both' />" +
                       "<input type='hidden' name='hi_process_info' id='hi_process_info' />" +
                       "<input type='hidden' name='hi_oasiswf_redirect' id='hi_oasiswf_redirect' value=''/></li>" ).css( { "width": "100%" } );
            } else {
               jQuery( "#publishing-action ul" ).append(
                       "<li style='margin-bottom:12px;'><input type='button' id='claimButton' class='button button-primary button-large'" +
                       " value='" + owf_submit_step_vars.claimButton + "' style='float:left;margin-top:10px;clear:both' />" +
                       "<input type='hidden' name='hi_process_info' id='hi_process_info' />" +
                       "<input type='hidden' name='hi_oasiswf_redirect' id='hi_oasiswf_redirect' value=''/></li>" ).css( { "width": "100%" } );
            }
         } );
      } else {
         jQuery( "#publish" ).hide();
         jQuery( ".loading" ).show();

         var check_claim = {
            action: 'check_for_claim_ajax',
            history_id: jQuery( "#hi_oasiswf_id" ).val(),
            security: jQuery( '#owf_check_claim_nonce' ).val()
         };

         jQuery.post( ajaxurl, check_claim, function ( response ) {
            if (response == -1) {
               return false; // Invalid nonce
            }
            jQuery( ".loading" ).hide();
            if ( ! response.success ) {
               jQuery( "#publishing-action ul" ).append( "<li style='margin-bottom:12px;'><input type='button' id='step_submit' class='button button-primary button-large' " +
                       "style='float:left;margin-top:10px;' value='" + owf_submit_step_vars.signOffButton + "' /></li>" );
            } else {
               jQuery( "#publishing-action ul" ).append( "<li style='margin-bottom:12px;'><input type='button' id='claimButton' class='button button-primary button-large' " +
                       "style='float:left;margin-top:10px;' value='" + owf_submit_step_vars.claimButton + "' /></li>" );
            }
         } );
      }
      jQuery( '.inline-edit-status' ).hide();
   }
   
   // When page is loaded, this function is processed
   if ( jQuery( "#hi_parrent_page" ).val() == "post_edit" ) {
      load_setting();
   }
   
    jQuery( document ).on( "click", "#step_submit", function () {

         // hook for custom validation before submitting to the workflow
         if ( typeof owSubmitToWorkflowPre === 'function' ) {
            var pre_submit_to_workflow_result = owSubmitToWorkflowPre();
            if ( pre_submit_to_workflow_result == false ) {
            return false;
            }
        }

        RPGUtil.validrunacf = false;
        RPGUtil.validrunrpg = false;

        //BESPOKE VALIDATION
        RPGUtil.valid = false;
        var $form = jQuery('form#post');
        var data = acf.serialize($form);
		data.action = 'rpg_validate_save_post';
		data = acf.prepare_for_ajax(data);

        jQuery('#rpg-teams-access').attr('style','');
        jQuery('#title').attr('style','');
        jQuery('div.rpg-error-message').remove();
            
        jQuery.ajax({
			url: acf.get('ajaxurl'),
			data: data,
			type: 'post',
			dataType: 'json',
			success: function(json){
				var json = json.data;
                var msg = '';

                //VALIDATE JSON
			    if (!json || json.valid || !json.errors) {	
                    RPGUtil.valid = true;
				    return;
			    }

                //GOT ERRORS
                RPGUtil.valid = false;
                if (json.errors && json.errors.length > 0) {
				    for (var i in json.errors) {	
                        var error = json.errors[i];	
                        msg += error.message + '<br/>';
                        var $input = $form.find('[name="' + error.input + '"]').first();

                        if (!$input.exists()) {
						    $input = $form.find('[name^="' + error.input + '"]').first();
					    }					
		
                        if (!$input.exists()) {
                            $input = jQuery('#'+ error.input);
                        }

					    if (!$input.exists()) {
						    continue;
					    }	

                        $input.attr('style','border:2px solid #F55E4F;');
                    }

                    // get $message
			        var $message = $form.children('div.rpg-error-message');

			        if (!$message.exists()) {
				        $message = jQuery('<div class="error notice rpg-error-message"><p></p></div>');
				        $form.prepend($message);
			        }

			        $message.children('p').html(msg);
                }
			}
		});
       
        //RUN ACF VALIDATION
        var $form = jQuery('#post');
        acf.do_action('submit', $form);
        
        acf.validation.$trigger = jQuery('#acf_dummy');
        acf.validation.fetch($form);

    });

   jQuery(document).ajaxComplete(function(event, xhr, settings) {
        if(settings.data){
            if(settings.data.indexOf('&action=acf%2Fvalidate_save_post') !== -1){
                RPGUtil.validrunacf = true;
                if (acf.validation.valid && RPGUtil.valid) {
                    normalWorkFlowSubmit(signOffSubmit);
                }
            }
            if(settings.data.indexOf('&action=rpg_validate_save_post') !== -1){
                RPGUtil.validrunrpg = true;
                if (acf.validation.valid && RPGUtil.valid) {
                    normalWorkFlowSubmit(signOffSubmit);
                }
            }
        }

        if(typeof(RPGUtil)!=='undefined'){
            if(RPGUtil.validrunrpg && RPGUtil.validrunacf){
                if(!acf.validation.valid || !RPGUtil.valid){
                    resetControls();
                }
            }
        }

        setTimeout(function(){check_for_dupes('actors-list-select');},800);
        setTimeout(function(){check_for_dupes('actors-set-select');},800);
    });

    function resetControls(){
        jQuery('#workflow_submit').removeAttr('disabled').removeClass('disabled button-disabled button-primary-disabled');
        jQuery('#exit_link').removeAttr('disabled').removeClass('disabled button-disabled button-primary-disabled');
        jQuery('#preview-action a').removeAttr('disabled').removeClass('disabled button-disabled button-primary-disabled');
		jQuery('#publishing-action .spinner').removeClass('is-active');
   }

    // to clear the dates
   jQuery( document ).on( "click", ".date-clear", function () {
      jQuery( this ).parent().children( ".date_input" ).val( "" );
   } );

   // close the step sign off popup
   jQuery( document ).on( "click", "#submitCancel, .modalCloseImg", function () {
      modal_close();
   } );

   // called on decision select change on the sign off popup.
   jQuery(document).on("change", "#decision-select", function () {
      var get_action = "";
      var decision = "";
      if ( "complete" == jQuery(this).val() ) {
         decision = "success";
      }
      if ( "unable" == jQuery(this).val() ) {
         decision = "failure";
      }
      actionSetting();

      var execute_sign_off_decision_data = {
         action: 'execute_sign_off_decision',
         post_id: jQuery("#hi_post_id").val(),
         history_id: jQuery("#hi_oasiswf_id").val(),
         decision: decision,
         security: jQuery('#owf_signoff_ajax_nonce').val()
      };

      jQuery("#sum_step_info").css("opacity", 1);
      jQuery("#step-loading-span").addClass("loading");

      jQuery.post(ajaxurl, execute_sign_off_decision_data, function ( response ) {
         if (response == -1) {
            return false; // Invalid nonce
         }

         jQuery("#step-loading-span").removeClass("loading");

         // if there are next steps
         if ( response.data.steps != "" ) {
            var next_steps = response.data.steps;
            jQuery("#step-select").removeAttr("disabled");
            jQuery("#step-select").find('option').remove();
            add_option_to_select("step-select", next_steps, 'step_name', 'step_id');

            // if there is only one possible next step, auto select it
            if (next_steps.length == 1) {
               jQuery("#step-select").change();
            }
         } else { // looks like we are on the last step of the workflow
            if ( "failure" == decision ) {
               showLastStepFailureMessage();
            } else if ( "success" == decision ) {
               var is_original_post = response.data.is_original_post;
               showLastStepSuccessMessage( is_original_post );

               jQuery("#completeSave").show();
               jQuery("#sum_step_info").hide();
            }
            // re-position the popup
            setPosition();
         }
      });
   });
   
   // called on change of Workflow Step during Sign off
   jQuery(document).on("change", "#step-select", function () {

      jQuery(".assign-loading-span").addClass("loading");

      // reset the error messages
      jQuery('#ow-step-messages').html("");
      jQuery('#ow-step-messages').addClass('owf-hidden');

      var get_sign_off_step_details_data = {
         action: 'get_sign_off_step_details',
         step_id: jQuery(this).val(),
         post_id: jQuery("#hi_post_id").val(),
         history_id: jQuery("#hi_oasiswf_id").val(),
         security: jQuery('#owf_signoff_ajax_nonce').val()
      };

      jQuery.post(ajaxurl, get_sign_off_step_details_data, function (response) {
         if (response == -1) {
            return false; // Invalid nonce
         }

         jQuery(".assign-loading-span").removeClass("loading");

         // if response is false then there are no users for given role..!
         if ( ! response.success ) {
            displayWorkflowSignOffErrorMessages( response.data.errorMessage );
            return false;
         }

         // update the stepProcess var
         // TODO : see if we can get rid of the stepProcess var
         if ( response.data.process != "" ) {
            stepProcess = response.data.process;
         }

         var users = "";

         // get assign to all value from the step
         var is_assign_to_all = "";
         if ( response.data.assign_to_all != "" ) {
            is_assign_to_all = parseInt(response.data.assign_to_all);
         }

         if ( jQuery("#assign_to_all").length ) { //if the field exists, update it
            jQuery("#assign_to_all").val(is_assign_to_all);
         } else { // add the field to the page
            jQuery('<input>').attr({
               type: 'hidden',
               id: 'assign_to_all',
               name: 'assign_to_all',
               value: is_assign_to_all
            }).appendTo('#new-step-submit-div');
         }

         // multiple actors applicable to all the steps
         jQuery("#one-actors-div").hide();

         // if assign to all is checked, then hide the assignee selection.
         if (is_assign_to_all === 1) {
            jQuery("#multi-actors-div").hide();
            jQuery("#actors-list-select").attr("disabled", true);
            jQuery("#actors-set-select").attr("disabled", true);
         } else { // "assign to all" is false, show the user selection
            jQuery("#multi-actors-div").show();
            jQuery("#actors-list-select").removeAttr("disabled");
            jQuery("#actors-set-select").removeAttr("disabled");

            if ( response.data.users != "" ) {
               if (typeof response.data.users[0] == 'object') {
                  users = response.data.users;
               }
            }
            add_option_to_select("actors-list-select", users, 'name', 'ID');
            check_for_dupes('actors-list-select');
            check_for_dupes('actors-set-select');
         }
      });
   });
   
   // assign users to the step
   jQuery( document ).on( "click", "#assignee-set-point", function () {

      jQuery( '#actors-list-select option:selected' ).each( function () {
         var v = jQuery( this ).val();
         var t = jQuery( this ).text();
         insert_remove_options( 'actors-list-select', 'actors-set-select', v, t );
      } );
      return false;
   } );

   //unassign users from the step
   jQuery( document ).on( "click", "#assignee-unset-point", function () {
      jQuery( '#actors-set-select option:selected' ).each( function () {
         var v = jQuery( this ).val();
         var t = jQuery( this ).text();
         insert_remove_options( 'actors-set-select', 'actors-list-select', v, t );
      } );
   } );
   
   
   // called when sign off a task - Sign off button click on the popup
   jQuery( document ).on( "click", "#submitSave", function () {
      var obj = this;
      // validate if all the required fields have data
      if ( !validateRequiredFormFields() ) {
         return false;
      }

      jQuery( ".changed-data-set span" ).addClass( "loading" );
      jQuery( "#submitSave" ).hide();
      
      // validate and get selected actors
      var actors = validateAndGetSelectedActors();

      // if no actors found, return
      if (! actors)
         return;
      
      var submit_post_to_step_data = {
         action:              'submit_post_to_step',
         post_id:             jQuery("#hi_post_id").val(),
         step_id:             jQuery("#step-select").val(),
         actors:              actors,
         due_date:            jQuery("#due-date").val(),
         sign_off_comments:   jQuery("#workflowComments").val(),
         task_user:           jQuery("#hi_task_user").val(),
         history_id:          jQuery("#hi_oasiswf_id").val(),
         custom_condition:    jQuery("#hi_custom_condition").val(),
         step_decision:       jQuery("#decision-select").val(),
         priority:            jQuery("#priority-select").val(),
         form:                jQuery("form#post").serialize(),
         security:            jQuery("#owf_signoff_ajax_nonce").val(),
         owf_action_name:     jQuery("#owf_action_name").val()  
      };

      jQuery.post(ajaxurl, submit_post_to_step_data, function (response) {
         if (response == -1) {
            return false; // Invalid nonce
         }

         // if response is false then there are no users for given role..!
         if ( ! response.success ) {
            displayWorkflowSignOffErrorMessages( response.data.errorMessage );

            // display the "submit" button again
            jQuery("#submitSave").show();

            return false;
         }

         jQuery( ".changed-data-set span" ).removeClass( "loading" );
         if ( jQuery( "#hi_parrent_page" ).val() == "inbox" ) {
            location.reload(); // simply reload the inbox page
         } else { // update the post status and save the post
            modal_close();
            jQuery( "#post_status" ).val( response.data.new_post_status );
            if ( jQuery("#hidden_post_status").length ) {
               jQuery("#hidden_post_status").val(response.data.new_post_status);
            }
            jQuery( "#save-post" ).click();
         }
      });
   });  

  // show/hide the publish date selection depending on "publish immediately" checkbox value
   jQuery( document ).on( "click", "#immediately-chk", function () {
      if ( jQuery( this ).attr( "checked" ) == "checked" ) {
         jQuery( "#immediately-span" ).hide();
      } else {
         jQuery( "#immediately-span" ).show();
      }
   } );
   
   // called when signing off from the last step of the workflow
   jQuery( document ).on( "click", "#completeSave", function () {

      // show loading and hide the button
      jQuery( ".changed-data-set span" ).addClass( "loading" );
      jQuery( this ).hide();

      // get the user assigned publish date, if any
      var im_date = getImmediatelyDate();

      var workflow_complete_data = {
         action:           'workflow_complete',
         history_id:       jQuery( "#hi_oasiswf_id" ).val(),
         post_id:          jQuery( "#hi_post_id" ).val(),
         task_user:        jQuery( "#hi_task_user") .val(),
         parent_page:      jQuery( "#hi_parrent_page" ).val(),
         immediately:      im_date,
         form:             jQuery("form#post").serialize(),
         security:         jQuery( '#owf_signoff_ajax_nonce' ).val(),
         owf_action_name:     jQuery("#owf_action_name").val()  
      };

      jQuery.post( ajaxurl, workflow_complete_data, function ( response ) {
         if ( response == -1 ) { // incorrect nonce
            return false;
         }

         // if response is false - looks like we have validation errors!
         if ( ! response.success ) {
            displayWorkflowSignOffErrorMessages( response.data.errorMessage );

            // display the "submit" button again
            jQuery( ".changed-data-set span" ).removeClass( "loading" );
            jQuery( "#completeSave" ).show();

            return false;
         }

         jQuery( document ).find( "#step_submit" ).remove();

         if ( jQuery( "#hi_parrent_page" ).val() == "inbox" ) {
            jQuery( ".changed-data-set span" ).removeClass( "loading" );
            // reload the inbox page
            location.reload();
         } else {
            jQuery( ".changed-data-set span" ).removeClass( "loading" );
            modal_close();
            jQuery( "#save_action" ).val("workflow_complete");
            jQuery( "#post_status" ).val(response.data.new_post_status);
            if ( jQuery("#hidden_post_status").length ) {
               jQuery("#hidden_post_status").val(response.data.new_post_status);
            }
            
            if(response.data.new_post_status == 'rev-sign-off'){
                //SHOW PAGE LISTING
                window.location.replace(window.location.origin + '/wp-admin/edit.php?post_type=page');
            } else {
                jQuery("#save-post").click();

               if(response.data.new_post_status == 'publish'){
                    window.location.replace(window.location.origin + '/wp-admin/edit.php?post_type=page');
                }
            }
         }
      } );
   } );

   jQuery( ".immediately" ).keydown( function () {

      jQuery( this ).css( "background-color", "#ffffff" );
   } );
   
   // called when cancelling the workflow
   jQuery(document).on("click", "#cancelSave", function () {
      var obj = this;

      // show loading and hide the button
      jQuery(".changed-data-set span").addClass("loading");
      jQuery(this).hide();

      var workflow_cancel_data = {
         action: 'workflow_cancel',
         history_id: jQuery("#hi_oasiswf_id").val(),
         post_id: jQuery("#hi_post_id").val(),
         comments: jQuery("#workflowComments").val(),
         review_result: jQuery("#decision-select").val(),
         security: jQuery('#owf_signoff_ajax_nonce').val()
      };

      jQuery.post(ajaxurl, workflow_cancel_data, function (response) {
         if ( response == -1 ) { // incorrect nonce
            return false;
         }

         // if response is false - looks like we have validation errors!
         if ( ! response.success ) {
            displayWorkflowSignOffErrorMessages( response.data.errorMessage );

            // display the "submit" button again
            jQuery( ".changed-data-set span" ).removeClass( "loading" );
            jQuery( "#cancelSave" ).show();

            return false;
         }

         jQuery(".changed-data-set span").removeClass("loading");
         jQuery(document).find("#step_submit").remove();

         if (jQuery("#hi_parrent_page").val() == "inbox") {
            location.reload();
         } else {
            modal_close();
            location.reload();
         }
      });
   });


   // called when a task is being claimed
   jQuery(document).on("click", "#claimButton", function () {
      var claim = jQuery(this);
      var post_id = jQuery("#hi_post_id").val();
      data = {
         action: 'claim_process',
         actionid: jQuery("#hi_oasiswf_id").val().trim(),
         security: jQuery('#owf_claim_process_ajax_nonce').val()
      };

      jQuery(this).parent().children(".loading").show();
      jQuery.post(ajaxurl, data, function (response) {
         if ( response === -1 ) {
            claim.parent().children(".loading").hide();
            return false;
         }
         if ( response.success ) {
            var ow_admin_url = response.data.url;
            var new_history_id = response.data.new_history_id;
            window.location.href = ow_admin_url + 'post.php?post=' + post_id +'&action=edit&oasiswf=' + new_history_id;
         }
      });
   });
   
   function signOffSubmit() {
      jQuery( '#hi_oasiswf_redirect' ).val( "step" );
      jQuery( "#new-step-submit-div" ).owfmodal( {
         onShow: function ( dlg ) {
            jQuery("#simplemodal-container").css({
               "max-height": "90%",
               "top":"60px"
            });
            jQuery( dlg.wrap ).css( 'overflow', 'auto' ); // or try ;
            // commented out, so that the above CSS can take effect
            //jQuery.modal.update();
            jQuery( "#multi-actors-div" ).show();
         }
      } );
      wfpath = "";
      stepProcess = "";
      calendar_action();
   }
   
   function calendar_action() {
      jQuery( "#due-date" ).datepicker( {
         autoSize: true,
         changeMonth: true,
         changeYear: true,
         yearRange: '1950:2050',
         dateFormat: owf_submit_step_vars.editDateFormat
      } );
      if ( jQuery('body > #ui-datepicker-div').length > 0 )
      {
         jQuery('#ui-datepicker-div').wrap('<div class="ui-oasis" />');
      }
   }
   
   modal_close = function () {
      wfpath = "";
      stepProcess = "";
      resetControls();
      jQuery.modal.close();
      if ( jQuery( "#hi_parrent_page" ).val() == "inbox" )
         jQuery( document ).find( "#step_submit_content" ).html( "" );
   }
   
   function showLastStepFailureMessage() {
      var msg = owf_submit_step_vars.lastStepFailureMessage;
      jQuery("#message_div").html(msg).css({"background-color": "#fbd7f0", "border": "1px solid #f989d8"}).show();

      jQuery("#cancelSave").show();
      jQuery("#submitSave").hide();
      jQuery("#completeSave").hide();

      jQuery("#sum_step_info").hide();
   }
   
    function showLastStepSuccessMessage( is_original_post ) {
      var msg = owf_submit_step_vars.lastStepSuccessMessage;
      jQuery("#message_div").html(msg).css({"background-color": "#dcddfa", "border": "1px solid #b0b4fa"}).show();

      jQuery("#submitSave").hide();
      jQuery("#cancelSave").hide();
      jQuery("#comments-div").hide();

      jQuery("#immediately-div").show();
      jQuery("#update_publish_msg").hide();

      // If future date is set then uncheck the checkbox by default & show immediate span
      if (jQuery('#immediately-chk').attr("checked") == "checked")
      {
         jQuery("#immediately-span").hide();
      } else
      {
         jQuery("#immediately-span").show();
      }

      // show the update message for revisions
      if ( !is_original_post ) {
         jQuery("#update_publish_msg").show();
      }
   }

   var insert_remove_options = function ( removeSelector, appendSelector, val, text ) {
      if ( typeof val !== 'undefined' ) {
         jQuery( "#" + removeSelector + " option[value='" + val + "']" ).remove();
         jQuery( '#' + appendSelector ).append( '<option value=' + val + '>' + text + '</option>' );
      }
   };
   
   
   function getImmediatelyDate() {
      var im_date = "";
      if ( jQuery( "#immediately-span" ).length > 0 && jQuery( "#immediately-span" ).is( ':visible' ) ) {
         if (isNaN(jQuery("#im-year").val())) {
            jQuery("#im-year").css("background-color", "#fadede");
            return im_date;
         }
         if (isNaN(jQuery("#im-day").val())) {
            jQuery("#im-day").css("background-color", "#fadede");
            return im_date;
         }
         if (isNaN(jQuery("#im-hh").val())) {
            jQuery("#im-hh").css("background-color", "#fadede");
            return im_date;
         }
         if (isNaN(jQuery("#im-mn").val())) {
            jQuery("#im-mn").css("background-color", "#fadede");
            return im_date;
         }

         im_date = jQuery("#im-year").val() + "-" +
            jQuery("#im-mon").val() + "-" +
            jQuery("#im-day").val() + " " +
            jQuery("#im-hh").val() + ":" +
            jQuery("#im-mn").val() + ":00";
      }

      return im_date;
   }
   
   setPosition = function () {
      jQuery( "#simplemodal-container" ).css( "max-height", "80%" );

      // call modal.setPosition, so that the window height can adjust automatically depending on the displayed fields.
      jQuery.modal.setPosition();
   }

   function actionSetting() {

      jQuery("#message_div").hide().html("");

      jQuery("#submitSave").show();
      jQuery("#comments-div").show();

      jQuery("#cancelSave").hide();
      jQuery("#completeSave").hide();
      jQuery("#immediately-div").hide();
      jQuery("#update_publish_msg").hide();

      jQuery("#sum_step_info").show();

      jQuery("#step-select").find('option').remove();
      jQuery("#actor-one-select").find('option').remove();
      jQuery("#actors-list-select").find('option').remove();
      jQuery("#actors-set-select").find('option').remove();

      jQuery("#step-select").attr("disabled", true);
      jQuery("#actor-one-select").attr("disabled", true);
      jQuery("#actors-list-select").attr("disabled", true);
      jQuery("#actors-set-select").attr("disabled", true);

      setPosition();
   }
   
    function validateAndGetSelectedActors() {

      // Case 1: Assign to all is checked
      // nothing to validates, simply return true
      var is_assigned_to_all = "";
      if ( jQuery('#assign_to_all').val() != "" ) {
         is_assigned_to_all = parseInt(jQuery('#assign_to_all').val());
         if (is_assigned_to_all === 1) {
            return true;
         }
      }

      // Case 2: Regular multi-actor selection
      // Validate if, at least one user is selected,
      // if not, display error message
      // if yes, return the selected actor(s)

      var selectedOptionCount = jQuery("#actors-set-select option").length;
      if (! selectedOptionCount ) {
         alert(owf_submit_step_vars.noAssignedActors);
         jQuery( ".changed-data-set span" ).removeClass("loading");
         jQuery( "#submitSave" ).show();
         return false;
      }
      var multi_actors = "", i = 1;
      jQuery( "#actors-set-select option" ).each(function () {
         if (i == selectedOptionCount)
            multi_actors += jQuery(this).val();
         else
            multi_actors += jQuery(this).val() + "@";
         i++;
      });
      if (multi_actors)
         return multi_actors;
      else
         return false;
   }
   
   function validateRequiredFormFields() {
      if ( !jQuery( "#decision-select" ).val() ) {
         alert( owf_submit_step_vars.decisionSelectMessage );
         return false;
      }

      if ( !jQuery( "#step-select" ).val() ) {
         alert( owf_submit_step_vars.selectStep );
         return false;
      }
      /* This is for checking that reminder email checkbox is selected in workflow settings.
       If YES then Due Date is Required Else Not */
      if ( owf_submit_step_vars.drdb != "" || owf_submit_step_vars.drda != "" || owf_submit_step_vars.defaultDueDays != "" )
      {
         if ( jQuery( "#due-date" ).val() == '' ) {
            alert( owf_submit_step_vars.dueDateRequired );
            return false;
         }
      }

      return true;
   }
  
   function displayWorkflowSignOffErrorMessages( errorMessages ) {
      jQuery( '.error' ).hide();
      jQuery('#ow-step-messages').html(errorMessages);
      jQuery('#ow-step-messages').removeClass('owf-hidden');

      // scroll to the top of the window to display the error messages
      jQuery(".simplemodal-wrap").css('overflow', 'hidden');
      jQuery(".simplemodal-wrap").animate({scrollTop: 0}, "slow");
      jQuery(".simplemodal-wrap").css('overflow', 'scroll');
      jQuery(".changed-data-set span").removeClass("loading");

      // call setPosition, so that the window height can adjust automatically depending on the displayed fields.
      setPosition();
   }

} );