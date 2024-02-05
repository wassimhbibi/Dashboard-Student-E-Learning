/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';

export const defaultNavigation: FuseNavigationItem[] = [
   
    {
        id      : 'apps',
        title   : 'Applications',
        type    : 'group',
        icon    : 'heroicons_outline:home',
        children: [
            {
                id   : 'apps.home',
                title: 'Home',
                type : 'basic',
                icon : 'heroicons_outline:home',
                link : '/apps/home'
            },
          
            {
                id   : 'apps.chat',
                title: 'Chat',
                type : 'basic',
                icon : 'heroicons_outline:chat-alt',
                link : '/apps/chat'
            },
            {
                id   : 'apps.historical',
                title: 'Historical',
                type : 'basic',
                icon : 'mat_outline:history',
                link : '/apps/historical'
            },
           

          
    
          
        ]
    },

   
    
];
export const compactNavigation: FuseNavigationItem[] = [
   
    {
        id      : 'apps',
        title   : 'Applications',
        tooltip : 'Applications',
        type    : 'aside',
        icon    : 'mat_outline:dashboard',
        children: [] // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
   
    
   
];
export const futuristicNavigation: FuseNavigationItem[] = [

    {
        id      : 'apps',
        title   : 'Applications',
        type    : 'group',
        children: [] // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
    
];
export const horizontalNavigation: FuseNavigationItem[] = [
  
    {
        id      : 'apps',
        title   : 'Applications',
        type    : 'group',
        icon    : 'mat_outline:dashboard',
        children: [] // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
    
    
];
