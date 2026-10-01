import React,{createContext,useContext,useState,type Dispatch,type ReactNode,type SetStateAction} from 'react';
import { DEMO_VIEWER } from '../lib/eventees/fixtures';
import { DEFAULT_VISIBILITY,type FanProfile } from '../lib/eventees/domain';
type NativeState={saved:string[];setSaved:Dispatch<SetStateAction<string[]>>;profile:FanProfile;setProfile:Dispatch<SetStateAction<FanProfile>>};
const Context=createContext<NativeState|null>(null);
export function NativeStateProvider({children}:{children:ReactNode}){
 const [saved,setSaved]=useState<string[]>([]);const [profile,setProfile]=useState<FanProfile>({...DEMO_VIEWER,visibility:{...DEFAULT_VISIBILITY}});
 return <Context.Provider value={{saved,setSaved,profile,setProfile}}>{children}</Context.Provider>;
}
export function useNativeState(){const value=useContext(Context);if(!value)throw new Error('NativeStateProvider missing');return value;}
