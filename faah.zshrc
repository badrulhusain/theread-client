npm(){
    command npm "$@"
    if [[ $? -ne 0 ]]; then
        afplay ~/coding/auction-client/src/assets/faah.mp3 &
    fi
}

