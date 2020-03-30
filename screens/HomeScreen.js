import React, {useEffect, useState} from 'react';
import {FlatList, Text, TouchableOpacity} from 'react-native';
import {Card} from 'react-native-elements';
import database from '@react-native-firebase/database';

const defaultUser = 'Zdh2ZOt9AOMKih2cNv00XSwk3fh1';
const arrayHolder = [];

const HomeScreen = (props) => {
    const [array, setArray] = useState([]);
    const [loading, setLoading] = useState(true);

    // Handle user snapshot response
    const onUserSnapshot = (snapshot) => {
        snapshot.forEach(song => {
            arrayHolder.push({
                key: song.key, // Add custom key for FlatList usage
                ...song,
            });
            database().ref(`/song/${song.key}/`).once('value', onSongSnapshot).catch(error => {
                console.log('Error: ' + error);
            });
        });
        setArray(arrayHolder);
        console.log('Home screen search new array: ' + arrayHolder.length);
        setLoading(false);
    };

    // Handle song snapshot response
    const onSongSnapshot = (snapshot) => {
        const song = arrayHolder.find(x => x.key === snapshot.key);
        if (song !== undefined) {
            song.name = snapshot.val().name;
            song.artist = snapshot.val().artist;
        }
    };

    useEffect(() => {
        database().ref(`/user/${defaultUser}/song/`).once('value', onUserSnapshot).catch(error => {
            console.log('Error: ' + error);
        });
    }, [defaultUser]);

    useEffect(() => {
        const newArray = arrayHolder.filter(item => {
            const itemName = `${item.name ? item.name.toUpperCase() : '' }`;
            const textData = props.searchText ? props.searchText : '';
            const startsWithName = itemName.indexOf(textData.toUpperCase()) > -1;
            const itemArtist = `${item.artist ? item.artist.toUpperCase() : '' }`;
            const startsWithArtist = itemArtist.indexOf(textData.toUpperCase()) > -1;
            return startsWithName | startsWithArtist;
        });
        setArray(newArray);
    }, [props.searchText]);

    if (loading) {
        return <Text>Loading songs...</Text>;
    } else {
        return (
            <FlatList data={array} renderItem={({item}) =>
                <Card>
                    <TouchableOpacity
                        onPress={(e) => props.onVideoSelected(item.key)}>
                        <Text>{item.name}</Text>
                        <Text style={{fontWeight: 'bold'}}>{item.artist}</Text>
                    </TouchableOpacity>
                </Card>
            }/>
        );
    }
};

export default HomeScreen;
