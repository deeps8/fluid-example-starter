import { Component, OnDestroy, OnInit } from '@angular/core';
import { TinyliciousClient } from '@fluidframework/tinylicious-client';
import { ContainerSchema, IFluidContainer, SharedMap } from 'fluid-framework';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit,OnDestroy {
  sharedTimeStamp : SharedMap | undefined;
  localTimeStamp : {time:string | undefined} | undefined;
  updateLocalTimeStamp: (()=>void) | undefined;

  async ngOnInit() {
      this.sharedTimeStamp = await this.getFluidData();
      this.syncData();
  }


  async getFluidData(){
      // Todo 1 : Configure a container
      const client = new TinyliciousClient();
      const containerSchema:ContainerSchema = {
        initialObjects : {sharedTimeStamp : SharedMap}
      }

      // Todo 2 : Get the container from the Fluid service
      let container: IFluidContainer;
      const containerId = location.hash.substring(1);
      if(!containerId){
        ({container} = await client.createContainer(containerSchema));
        const id  = await container.attach();
        location.hash = id;
      }
      else{
        ({container} = await client.getContainer(containerId,containerSchema));
      }


      // Todo 3 : Return the Fluid Timestamp object
      return container.initialObjects['sharedTimeStamp'] as SharedMap;

  }

  syncData(){
    // only sync if the Fluid SharedMap object is defined.
    if(this.sharedTimeStamp){
      // Todo 4 : Set the value to the localTImeStamp object that will appear in the UI.
      this.updateLocalTimeStamp = ()=>{this.localTimeStamp = {time:this.sharedTimeStamp!.get("time")}};
      this.updateLocalTimeStamp();

      // Todo 5 : Register hte Handlers
      this.sharedTimeStamp!.on('valueChanged',this.updateLocalTimeStamp!);
    }
  }


  ngOnDestroy(): void {
    this.sharedTimeStamp!.off('valueChanged',this.updateLocalTimeStamp!);
  }

  timeButton(){
    this.sharedTimeStamp!.set("time",Date.now().toString());
  }

}
