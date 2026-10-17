import Foundation
import Vision
import CoreImage
import ImageIO
import UniformTypeIdentifiers

// Produce transparency masks only. The original photograph supplies every RGB pixel.
let arguments = CommandLine.arguments
guard arguments.count == 3 else {
    fatalError("Usage: swift scripts/extract-portrait-masks.swift source.jpeg mask.png")
}
let sourceURL = URL(fileURLWithPath: arguments[1])
let outputURL = URL(fileURLWithPath: arguments[2])
let handler = VNImageRequestHandler(url: sourceURL, options: [:])
let request = VNGenerateForegroundInstanceMaskRequest()
try handler.perform([request])
guard let observation = request.results?.first, !observation.allInstances.isEmpty else {
    fatalError("No foreground found in \(sourceURL.lastPathComponent)")
}
let mask = try observation.generateScaledMaskForImage(forInstances: observation.allInstances, from: handler)
let context = CIContext(options: [.useSoftwareRenderer: false])
let image = CIImage(cvPixelBuffer: mask)
guard let cgImage = context.createCGImage(image, from: image.extent),
      let destination = CGImageDestinationCreateWithURL(outputURL as CFURL, UTType.png.identifier as CFString, 1, nil) else {
    fatalError("Could not create mask PNG")
}
CGImageDestinationAddImage(destination, cgImage, nil)
guard CGImageDestinationFinalize(destination) else { fatalError("Could not save mask") }
print("Mask only: \(outputURL.path)")
