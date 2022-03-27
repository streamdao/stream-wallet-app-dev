import React, { memo, useState, useEffect } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { View, FlatList, Image } from 'react-native';
import { Card, Paragraph } from 'react-native-paper';
import { theme } from '../core/theme';
import { normalizeNumber } from '../utils';
// const addCommas = new Intl.NumberFormat('en-US');

const NFTcard = (info: object) => {
    let preview, title;
    
	if (info.nft) {
        preview = info.nft.item.Preview_URL;
        title = info.nft.item.Title;

	} else {
        preview = info.Preview_URL;
        title = info.Title;
	}
    const { onPress } = info;

    if (info.fullCard === true) {
        return (     
            <TouchableOpacity 
                onPress={onPress} 
                style={{
                    backgroundColor: 'white',  
                    borderRadius: 18,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    width: 183,
                    height: 259,
                    marginBottom: 16,
                   
                    paddingHorizontal: 16,
                }}
            >
                <View
                    style={{
                        width: 151,
                        height: 125,
                        marginTop: 18,
                        
                    }}
                >
                    <Image
                        source={{uri: preview}}
                        style={{flex: 1, height: undefined, width: undefined, resizeMode: 'cover', borderRadius: 8, overlayColor: 'white'}}
                    />   
                </View>
                <Text
                    style={{marginTop: 16, marginBottom: 4, ...theme.fonts.Nunito_Sans.Body_M_Bold, color: theme.colors.black_one}}
                    numberOfLines={1}
                >
                    {title}
                </Text>
                {/* <Text
                    style={{marginLeft: 16, marginBottom: 16, ...theme.fonts.Nunito_Sans.Caption_M_SemiBold, color: theme.colors.black_five}}
                >
                    Author's Name
                </Text> 
                    
                <View>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', paddingVertical: 10,}}>
                        <Text style={{...theme.fonts.Nunito_Sans.Caption_M_Bold, color: theme.colors.black_one}}>
                            $1,243
                        </Text>
                        <View
                        style={{
                                borderLeftColor:
                                theme.colors.black_six,
                                borderLeftWidth: 1,
                                marginHorizontal: 8,
                                marginVertical: 3,
                            }}
                        >
                        </View>
                        <Text style={{...theme.fonts.Nunito_Sans.Caption_M_Bold}}>
                            45%
                            
                        </Text>
                    </View>
                </View> */}
            </TouchableOpacity>
        );
    } else {
        return (     
            <TouchableOpacity 
                onPress={onPress} 
                style={{
                    backgroundColor: 'white',  
                    width: 152,
                    height: 143,
                    marginBottom: 21,
                    marginRight: 16,
                }}
            >
                <Image
                    source={{uri: preview}}
                    style={{flex: 1, height: undefined, width: undefined, resizeMode: 'cover' , borderRadius: 18, borderTopRightRadius: 18, borderTopLeftRadius: 18, borderWidth: 1, borderColor: theme.colors.border, overlayColor: 'white',}}
                />
                <View>
                   {/*} <View style={{ flexDirection: 'row', justifyContent: 'center', paddingVertical: 10,}}>
                        <Text style={{...theme.fonts.Nunito_Sans.Caption_M_Bold, color: theme.colors.black_one}}>
                            $1,243 
                        </Text>
                        <View
                        style={{
                                borderLeftColor:
                                theme.colors.black_six,
                                borderLeftWidth: 1,
                                marginHorizontal: 8,
                                marginVertical: 3,
                            }}
                        >
                        </View>
                        <Text style={{...theme.fonts.Nunito_Sans.Caption_M_Bold}}>
                            45%
                           
                        </Text>
                        </View> */}
                </View>
            </TouchableOpacity>
        );
    }
};

export default NFTcard;
