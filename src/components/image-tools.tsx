
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ImageCompressor from "@/components/image-compressor";
import ImageConverter from "@/components/image-converter";
import { ArrowRightLeft, Minimize, FileText } from "lucide-react";
import PdfTools from "./pdf-tools";

export default function ImageTools() {
  return (
    <Tabs defaultValue="compressor" className="w-full max-w-7xl">
      <div className="flex justify-center">
        <TabsList className="mb-6 grid w-full grid-cols-3 md:w-auto">
          <TabsTrigger value="compressor">
            <Minimize className="mr-2" />
            Compressor
          </TabsTrigger>
          <TabsTrigger value="converter">
            <ArrowRightLeft className="mr-2" />
            Converter
          </TabsTrigger>
          <TabsTrigger value="pdf-tools">
            <FileText className="mr-2" />
            PDF Tools
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="compressor">
        <ImageCompressor />
      </TabsContent>
      <TabsContent value="converter">
        <ImageConverter />
      </TabsContent>
      <TabsContent value="pdf-tools">
        <PdfTools />
      </TabsContent>
    </Tabs>
  );
}
