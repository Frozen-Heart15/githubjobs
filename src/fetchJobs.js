import React,{useReducer, useEffect} from 'react';
import Axios from 'axios';
 
const BASE_URL = 'https://cors-anywhere.herokuapp.com/https://jobs.github.com/positions.json'

function reducer(state, action){
    switch(action.type){
         case 'make_request':
             return { loading:true, jobs:[]}
         case 'get_data':
             return {...state, loading:false, jobs: action.payload.jobs}
         case 'error':
             return {...state, loading:false, error: action.payload.error}
         case 'hasNextPage':
             return {...state, hasNextPage: action.payload.hasNextPage }
             default:
             return state            
    }
}

export default function FetchJobs(params, page){
    const [state, dispatch] = useReducer(reducer, {jobs:[], loading:true})

    useEffect(()=>{
        const cancelToken1 = Axios.CancelToken.source()
        dispatch({type:'make_request'})
        Axios.get(BASE_URL,{
            cancelToken: cancelToken1.token,
            params:{markdown:true, page:page, ...params}
        }).then(res=>{
            dispatch({ type:'get_data', payload: {jobs: res.data}})
        }).catch(e=>{
            if(Axios.isCancel(e)) return
            dispatch({type:'error', payload:{error:e}})
        })

        const cancelToken2 = Axios.CancelToken.source()
        
        Axios.get(BASE_URL,{
            cancelToken: cancelToken2.token,
            params:{markdown:true, page:page+1, ...params}
        }).then(res=>{
            dispatch({ type:'hasNextPage', payload: {hasNextPage: res.data.length !== 0}})
        }).catch(e=>{
            if(Axios.isCancel(e)) return
            dispatch({type:'error', payload:{error:e}})
        })

        return () => {
            cancelToken1.cancel()
            cancelToken2.cancel()
        }
    },[params,page])

  return state; 
}