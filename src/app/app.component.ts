import {Component, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {initFlowbite} from "flowbite";
import {FormsModule} from "@angular/forms";
import {JsonPipe, KeyValuePipe} from "@angular/common";
import {RecHeader} from "./header.type";


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule, JsonPipe, KeyValuePipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {

  recData: string = '';
  headers: RecHeader[] = [];
  countData = 0;

  ngOnInit(): void {
    initFlowbite();
  }

  parseRec(): void {

    const lines = this.recData.split('\n');
    const headerSize: number = Number(lines[0].split(' ')[0]);

    if (!headerSize) {
      throw new Error('Header size not found');
    }

    delete lines[0];

    let i = 1
    let dataBlockSize = 0;

    // Parse Header
    for (i; i <= headerSize; i++) {
      const headerSize = Number(lines[i].substring(37, 40).trim());

      this.headers.push({
        fieldName: lines[i].substring(0, 13).trim().slice(1),
        fieldDescription: lines[i].substring(45).trim().replaceAll('.', ''),
        size: headerSize,
        data: []
      });

      dataBlockSize = dataBlockSize + headerSize;
    }

    let compiledData = '';
    for (i; i < lines.length; i++) {
      compiledData = compiledData + lines[i];
    }

    const dataBlocks = compiledData.split('!').toString().replaceAll(",", "");
    this.countData = dataBlocks.length;

    for (let dataBlock of this.cutData(dataBlocks, dataBlockSize)) {

      let slicePositionStart = 0;
      const rows: string[]  = [];

      for (let header of this.headers) {
        header.data.push(dataBlock.slice(slicePositionStart, slicePositionStart + header.size));
        slicePositionStart = slicePositionStart + header.size;
      }

    }
  }

  clear(): void {
    this.recData = '';
    this.headers = [];
  }

  private cutData(data: string, size: number): string[] {
    const chunk: string[] = [];

    for (let i = 0; i < data.length; i += size) {
      chunk.push(data.slice(i, i + size));
    }

    return chunk;
  }
}
