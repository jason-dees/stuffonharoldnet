using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ImageMagick;

namespace jhdeescomnet.Controllers {
	[Route("api/[controller]")]
	[ApiController]
	public class ImageController : ControllerBase {
		const string imageDirectory = "wwwroot/img";
		[HttpGet(Name = "GetImages")]
		public ActionResult<List<string>> Get() {
			var files = GetImageFileList(imageDirectory).Select(name => name.Replace($"{imageDirectory}/", ""));

			return files.ToList();
		}

		[HttpGet("{imageName}", Name = "GetImage")]
		public IActionResult GetImage([FromRoute]string imageName, [FromQuery]int width = 0, [FromQuery]int height = 0) {
			var imagePath = $"{imageDirectory}/{imageName}";

			if (imageName.ToLower() == "random"){
				var images = GetImageFileList(imageDirectory);
				var random = new Random().Next(0, images.Count());
				imagePath = images.ElementAt(random);
			}

			if (!System.IO.File.Exists(imagePath)) {
				return NotFound();
			}

			using (var image = new MagickImage(imagePath)) {
                width = width == 0 ? image.Width : width;
                height = height == 0 ? image.Height : height;

				var ratio = (double)image.Width / image.Height;
				var scalePercentage = new Percentage(100);
				 
				if(width / height > ratio) {
					scalePercentage = new Percentage((double)height / image.Height * 100);
				}
				else {
					scalePercentage = new Percentage((double)width / image.Width * 100);
				}

				image.Resize(scalePercentage);

				return File(image.ToByteArray(), "image/jpeg");

			}

			throw new Exception();
		}

		IEnumerable<string> GetImageFileList(string path){
			return Directory.EnumerateFiles(path);
		}
	}
}