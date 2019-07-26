import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MenuitemService {
  leftMenuItems: MenuItem[] = [
    {label: 'Run', icon: 'assets/ic_24px_run.png', selectedIcon: 'assets/ic_24px_run_selected.png'},
    {label: 'Explore', icon: 'assets/ic_24px_explore.png', selectedIcon: 'assets/ic_24px_explore_selected.png'}
  ];

  rightMenuItems: MenuItem[] = [
    {label: 'Designs', icon: 'assets/ic_24px_designs.png', selectedIcon: 'assets/ic_24px_designs_selected.png'}
  ];
}

export interface MenuItem {
  label: string
  icon: string
  selectedIcon: string
}
