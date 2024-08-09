import React, { createContext, useState, useRef, useEffect } from 'react';
import axios from 'axios';

export const PlayerContext = createContext();

const PlayerContextProvider = ({ children }) => {
    const audioRef = useRef();
    const seekBar = useRef();

    const [albumSongs, setAlbumSongs] = useState([]);
    const [allSongs, setAllSongs] = useState([]);
    const [isAlbumContext, setIsAlbumContext] = useState(true);
    const [currentSongIndex, setCurrentSongIndex] = useState(0);
    const [track, setTrack] = useState(null);
    const [songsData, setSongsData] = useState([]); 
    const [albumsData, setAlbumsData] = useState([]); 
    const [playStatus, setPlayStatus] = useState(false);
    const [time, setTime] = useState({
        currentTime: { second: 0, minute: 0 },
        totalTime: { second: 0, minute: 0 }
    });

    const url = 'http://localhost:4000';

    const play = () => {
        audioRef.current.play();
        setPlayStatus(true);
    };

    const pause = () => {
        audioRef.current.pause();
        setPlayStatus(false);
    };

    const playWithId = (id, fromAlbum = true) => {
        const songList = fromAlbum ? songsData.filter(song => song.album === id) : songsData;
        const selectedSongIndex = songList.findIndex(song => song._id === id);
        if (selectedSongIndex !== -1) {
            setIsAlbumContext(fromAlbum);
            setTrack(songList[selectedSongIndex]);
            setCurrentSongIndex(selectedSongIndex);

            audioRef.current.src = songList[selectedSongIndex].file; // Set the audio source

            audioRef.current.onloadedmetadata = () => {
                play(); // Play only after metadata is loaded
            };
        }
    };

    const nextSong = () => {
        const songList = isAlbumContext ? albumSongs : allSongs;
        if (currentSongIndex < songList.length - 1) {
            const newIndex = currentSongIndex + 1;
            setCurrentSongIndex(newIndex);
            setTrack(songList[newIndex]);

            audioRef.current.src = songList[newIndex].file; // Set the audio source

            audioRef.current.onloadedmetadata = () => {
                play(); // Play only after metadata is loaded
            };
        }
    };

    const prevSong = () => {
        if (currentSongIndex > 0) {
            const newIndex = currentSongIndex - 1;
            setCurrentSongIndex(newIndex);
            setTrack(isAlbumContext ? albumSongs[newIndex] : allSongs[newIndex]);

            audioRef.current.src = (isAlbumContext ? albumSongs[newIndex] : allSongs[newIndex]).file; // Set the audio source

            audioRef.current.onloadedmetadata = () => {
                play(); // Play only after metadata is loaded
            };
        }
    };

    const seekSong = (e) => {
        audioRef.current.currentTime = (e.nativeEvent.offsetX / seekBar.current.offsetWidth) * audioRef.current.duration;
    };

    const getSongsData = async () => {
        try {
            const response = await axios.get(`${url}/api/song/list`);
            setAllSongs(response.data.songs);
            setTrack(response.data.songs[0]);
        } catch (error) {
            console.error("Error fetching songs data:", error);
        }
    };

    const getAlbumsData = async () => {
        try {
            const response = await axios.get(`${url}/api/album/list`);
            setAlbumsData(response.data.albums);
        } catch (error) {
            console.error("Error fetching albums data:", error);
        }
    };

    useEffect(() => {
        audioRef.current.ontimeupdate = () => {
            const currentTime = audioRef.current.currentTime;
            const duration = audioRef.current.duration;
            seekBar.current.style.width = `${(currentTime / duration) * 100}%`;
            setTime({
                currentTime: { second: Math.floor(currentTime % 60), minute: Math.floor(currentTime / 60) },
                totalTime: { second: Math.floor(duration % 60), minute: Math.floor(duration / 60) }
            });
        };
    }, []);

    useEffect(() => {
        getSongsData();
        getAlbumsData();
    }, []);

    const contextValue = {
        audioRef,
        seekBar,
        track,
        playStatus,
        time,
        play,
        pause,
        playWithId,
        nextSong,
        prevSong,
        seekSong,
        songsData: allSongs,
        albumsData,
        playSongFromAlbum: (songs, index) => {
            setAlbumSongs(songs);
            setCurrentSongIndex(index);
            setIsAlbumContext(true);
            setTrack(songs[index]);

            audioRef.current.src = songs[index].file; // Set the audio source

            audioRef.current.onloadedmetadata = () => {
                play(); // Play only after metadata is loaded
            };
        },
        playSongFromHome: (songs, index) => {
            setAllSongs(songs);
            setCurrentSongIndex(index);
            setIsAlbumContext(false);
            setTrack(songs[index]);

            audioRef.current.src = songs[index].file; // Set the audio source

            audioRef.current.onloadedmetadata = () => {
                play(); // Play only after metadata is loaded
            };
        },
    };

    return (
        <PlayerContext.Provider value={contextValue}>
            {children}
        </PlayerContext.Provider>
    );
};

export default PlayerContextProvider;
