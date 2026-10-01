import { Link, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import App from '../../../App';
import { DEMO_EVENTS } from '../../../../lib/eventees/fixtures';
export default function EventScreen(){
 const {id}=useLocalSearchParams<{id:string}>();
 if(!DEMO_EVENTS.some(event=>event.id===id))return <View style={{flex:1,justifyContent:'center',padding:24,gap:16}}><Text style={{color:'#fff',fontSize:28}}>Event nicht gefunden.</Text><Link href="/" style={{color:'#ff7848'}}>Events entdecken</Link></View>;
 return <App/>;
}
