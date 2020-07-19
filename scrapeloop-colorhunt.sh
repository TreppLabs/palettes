# re-adjust starting number if run stalls or fails midway
for ((i = 0; i < 200100; i+=100)); do { node Scraper-colorhunt.js $i $(($i + 100)) ; sleep 5; }  ; done
