// Example starter JavaScript for disabling form submissions if there are invalid fields
(function () {
    'use strict'

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.validated-form');


    // Loop over them and prevent submission
    Array.prototype.slice.call(forms)
        .forEach(function (form) {
        form.addEventListener('submit', function (event) {
            if (!form.checkValidity() || !isRatingValid()) {
                if(isRatingValid() === false) showErrMsg();
                event.preventDefault()
                event.stopPropagation()
            }

            form.classList.add('was-validated')
        }, false)
        });

        
        const isRatingValid = () => {
            const radios = document.getElementsByName('review[rating]');
            let ratingValid = false;
            //Checks that a Rating was selected
            if (radios.length > 0) {
                for (let i = 1; i < radios.length; i++) {
                    if (radios[i].checked) ratingValid = true;
                    //Removes error message once a rating is selected
                    radios[i].addEventListener('click', function () {
                        document.querySelector('.rating-error-msg').innerHTML = '';
                    });
                }
                //Returns false if no ratings are selected on Review
                return ratingValid;
            } else {
                //Return true if submitted form is not for a Review
                return true;
            }
        }
        // Displays error message when Rating is not selected
        const showErrMsg = () => {
            document.querySelector('.rating-error-msg').innerHTML = 'Please select a rating.';
        }
})();