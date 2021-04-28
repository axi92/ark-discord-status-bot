#!/bin/bash
STEAM_ID=$1

declare -a server_name
declare -a server_user
declare -a server_pw
declare -a server_ip
declare -a server_port

server_name=(
  Aberration
  Center
  Crystal
  Event
  Extinction
  Fjördur
  Genesis
  Island
  Ragnarok1
  Ragnarok2
  Scorched
  Test
  Valguero
  Volcano
)

server_user=(
  ftpusername #aberration
  ftpusername #center
  ftpusername #crystal
  ftpusername #event
  ftpusername #extinction
  ftpusername #fjördur
  ftpusername #genesis
  ftpusername #island
  ftpusername #ragnarok1
  ftpusername #ragnarok2
  ftpusername #scorched
  ftpusername #test
  ftpusername #valguero
  ftpusername #volcano
)

server_pw=(
  ftppassword #aberration
  ftppassword #center
  ftppassword #crystal
  ftppassword #event
  ftppassword #extinction
  ftppassword #fjördur
  ftppassword #genesis
  ftppassword #island
  ftppassword #ragnarok1
  ftppassword #ragnarok2
  ftppassword #scorched
  ftppassword #test
  ftppassword #valguero
  ftppassword #volcano
)

server_ip=(
  127.0.0.1 #aberration
  127.0.0.1 #center
  127.0.0.1 #crystal
  127.0.0.1 #event
  127.0.0.1 #extinction
  127.0.0.1 #fjördur
  127.0.0.1 #genesis
  127.0.0.1 #island
  127.0.0.1 #ragnarok1
  127.0.0.1 #ragnarok2
  127.0.0.1 #scorched
  127.0.0.1 #test
  127.0.0.1 #valguero
  127.0.0.1 #volcano
)

server_port=(
  21 #aberration
  21 #center
  21 #crystal
  21 #event
  21 #extinction
  21 #fjördur
  21 #genesis
  21 #island
  21 #ragnarok1
  21 #ragnarok2
  21 #scorched
  21 #test
  21 #valguero
  21 #volcano
)

## Array Loop
for i in "${!server_ip[@]}"
do
  #echo "Retrieving information from ${server_name[$i]} ftp..."
  aberration_files=$(lftp -c 'set ssl:verify-certificate no; set ftp:use-mode-z true; open ftp://'${server_user[$i]}':'${server_pw[$i]}'@'${server_ip[$i]}':'${server_port[$i]}'; cd ./ShooterGame/Saved/SavedArks/; cls -B -l --date --time-style=+"%Y-%m-%d_%H:%M:%S"')
  count=$(echo ${aberration_files} | sed 's/ -/\n-/g' | sed 's/ d/\nd/g' | awk '/'${STEAM_ID}'.arkprofile/ {print $6 " " $7}' | wc -l)
  if [ $count -eq "1" ]; then
    echo "Character found on ${server_name[$i]}"
    exit 0;
  fi
done
echo "Charater not found, maybe somebody forgott his character in the cloud?!"
