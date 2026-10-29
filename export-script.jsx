// Get project and active sequence
var project = app.project;
var sequence = project ? project.activeSequence : null;

// Set this to the folder containing your Adobe export presets
var presetsPath = "C:\\Adobe Presets\\";

// Check before accessing sequence properties or project paths
if (!sequence) {
  alert("No active sequence found!");
} else if (!project.path) {
  alert("Please save the project before exporting.");
} else {
  try {
    var projectPath = project.path; // Full path of the .prproj file
    var projectFolder = projectPath.substring(0, projectPath.lastIndexOf("\\")); // Extract folder

    if (!projectFolder) {
      throw new Error("Could not determine the project folder.");
    }

    var rendersDirectory = projectFolder + "\\Renders";

    // Default to the full timeline name for client-supplied keys
    var deliveryName = sequence.name;
    var MXF_name = sequence.name;

    // For internal keys, remove any suffix after _F<number>
    // Example: Campaign_F1234567_v2
    // deliveryName: Campaign_F1234567
    // MXF_name: F1234567
    var keyMatch = /^(.*_)(F[0-9]+)(?:_.*)?$/.exec(sequence.name);

    // File names
    if (keyMatch) {
      deliveryName = keyMatch[1] + keyMatch[2];
      MXF_name = keyMatch[2]; // Only take the key number
    }

    // Define export settings
    // The .epr preset determines the actual format.
    var exportSettings = [
      {
        name: "HiRes",
        preset: presetsPath + "Hi_Res.epr",
        extension: ".mp4",
      },
      {
        name: "MXF",
        preset: presetsPath + "MXF.epr",
        extension: ".mxf",
      },
      {
        name: "LowRes",
        preset: presetsPath + "Low_Res.epr",
        extension: ".mp4",
      },
    ];

    // Check every preset before queuing any jobs
    var problems = [];

    for (var i = 0; i < exportSettings.length; i++) {
      var setting = exportSettings[i];

      if (setting.name == "LowRes") {
        setting.outputPath =
          rendersDirectory +
          "\\" +
          deliveryName +
          "_LowRes" +
          setting.extension;
      } else if (setting.name == "MXF") {
        setting.outputPath =
          rendersDirectory + "\\" + MXF_name + setting.extension;
      } else {
        setting.outputPath =
          rendersDirectory + "\\" + deliveryName + setting.extension;
      }

      if (!new File(setting.preset).exists) {
        problems.push("Missing preset: " + setting.preset);
      }
    }

    if (problems.length > 0) {
      throw new Error(problems.join("\n\n"));
    }

    // Ensure the Renders directory exists
    var folder = new Folder(rendersDirectory);

    if (!folder.exists && !folder.create()) {
      throw new Error(
        "Could not create the Renders folder:\n" + rendersDirectory,
      );
    }

    // Launch Adobe Media Encoder
    app.encoder.launchEncoder();

    var queued = [];
    var failed = [];

    for (var j = 0; j < exportSettings.length; j++) {
      var exportSetting = exportSettings[j];

      try {
        // Queue render in Adobe Media Encoder
        var jobID = app.encoder.encodeSequence(
          sequence,
          exportSetting.outputPath,
          exportSetting.preset,
          1, // Export only between In and Out points
          false,
        );

        if (jobID && String(jobID) != "0") {
          queued.push(exportSetting.name);
        } else {
          failed.push(exportSetting.name + ": no job ID returned.");
        }
      } catch (queueError) {
        failed.push(
          exportSetting.name +
            ": " +
            (queueError.message || String(queueError)),
        );
      }
    }

    var message =
      queued.length + " of " + exportSettings.length + " exports queued.";

    if (queued.length > 0) {
      message += "\n\nQueued: " + queued.join(", ");
    }

    if (failed.length > 0) {
      message += "\n\nFailed:\n" + failed.join("\n");
    }

    message += "\n\nOutput folder:\n" + rendersDirectory;

    alert(message);
  } catch (error) {
    alert("Export stopped:\n\n" + (error.message || String(error)));
  }
}
