# Premiere Pro Export Automation

An Adobe ExtendScript script that queues three broadcast-ready delivery versions of the active Premiere Pro timeline in Adobe Media Encoder.

I developed this tool for a professional video production workflow to reduce repeated preset selection and filename entry when preparing final deliveries.

## Features

- Queues HiRes MP4, MXF and LowRes MP4 exports
- Applies a separate Adobe export preset to each version
- Saves exports to a Renders folder beside the Premiere project
- Uses the timeline's In and Out points
- Handles internal key numbers and client-supplied filenames
- Checks that the required presets exist before submitting jobs
- Reports successful submissions and queue errors

## Filename handling

For internal jobs, timeline names contain an underscore followed by an F and digits. Any underscore suffix after the key number is removed from delivery filenames.

For example:

| Timeline name        | HiRes                 | MXF             | LowRes                       |
| -------------------- | --------------------- | --------------- | ---------------------------- |
| Campaign_F1234567_v2 | Campaign_F1234567.mp4 | F1234567.mxf    | Campaign_F1234567_LowRes.mp4 |
| CLIENT12345          | CLIENT12345.mp4       | CLIENT12345.mxf | CLIENT12345_LowRes.mp4       |

When no internal key pattern is found, the full timeline name is preserved.

## Setup

1. Install Adobe Premiere Pro and Adobe Media Encoder.
2. Prepare these export presets:
   - Hi_Res.epr
   - MXF.epr
   - Low_Res.epr
3. Place the presets in one folder.
4. Update `presetsPath` in `export-sequence.jsx` to that folder:

   ```javascript
   var presetsPath = "C:\\Adobe Presets\\";
   ```

The presets determine the encoding settings. The HiRes and LowRes presets should produce MP4 files and the MXF preset should produce MXF files.

Preset files are not included in this repository.

## Usage

1. Save your Premiere project.
2. Activate the timeline you want to export.
3. Set its In and Out points.
4. Run `export-sequence.jsx` in Premiere's ExtendScript host using your scripting runner.
5. Review the submission summary.
6. Check the jobs in Adobe Media Encoder and start the batch.

The script queues exports; it does not start the batch automatically.

Note: This script must run inside Adobe Premiere Pro's ExtendScript
environment.

Available options:

- **Visual Studio Code with Adobe's ExtendScript Debugger extension:**
  Adobe's recommended ExtendScript development environment.
- **Adobe ExtendScript Toolkit CC:** the legacy application used
  for this workflow. Compatibility may vary with Premiere versions.

## Requirements and limitations

- Requires Adobe applications and compatible export presets
- Uses Windows paths
- Filename conflicts and unsupported characters are left to Adobe's default handling

## Technology

Adobe ExtendScript / JavaScript.
