import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MenuitemService {
  leftMenuItems: MenuItem[] = [
    {label: 'Run', icon: 'assets/ic_24px_run.png', selectedIcon: 'assets/ic_24px_run_selected.png'},
    {label: 'Explore', icon: 'assets/ic_24px_explore.png', selectedIcon: 'assets/ic_24px_explore_selected.png'}
  ];

  rightMenuItems: MenuItem[] = [];
}

export interface MenuItem {
  label: string
  icon: string
  selectedIcon: string
}
