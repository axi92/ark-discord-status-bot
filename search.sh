#!/bin/bash
STEAM_ID=$1

source ./search_config.sh

## Array Loop
for i in "${!server_ip[@]}"
do
  #echo "Retrieving information from ${server_name[$i]} ftp..."
  time aberration_files=$(lftp -c 'set ssl:verify-certificate no; set ftp:use-mode-z true; open ftp://'${server_user[$i]}':'${server_pw[$i]}'@'${server_ip[$i]}':'${server_port[$i]}'; cd ./ShooterGame/Saved/SavedArks/; cls -B -l --date --time-style=+"%Y-%m-%d_%H:%M:%S"')
  count=$(echo ${aberration_files} | sed 's/ -/\n-/g' | sed 's/ d/\nd/g' | awk '/'${STEAM_ID}'.arkprofile/ {print $6 " " $7}' | wc -l)
  if [ $count -eq "1" ]; then
    echo "Character found on ${server_name[$i]}"
    exit 0;
  fi
done
echo "Charater not found, maybe somebody forgott his character in the cloud?!"
exit 1;
