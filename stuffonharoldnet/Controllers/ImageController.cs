using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ImageMagick;
using stuffonharoldnet.Services;
using System.Threading.Tasks;

namespace jhdeescomnet.Controllers {
	[Route("api/[controller]")]
	[ApiController]
	public class ImageController : ControllerBase {

		const string imageDirectory = "wwwroot/img";
		readonly IKnowAzureImages _azureImageService;

		public ImageController(IKnowAzureImages azureImages){
			_azureImageService = azureImages;
		}

		[HttpGet(Name = "GetImages")]
		public async Task<ActionResult<List<string>>> Get() {
			return await GetImageFileList();
		}

		[HttpGet("random", Name = "GetRandomImage")]
		public async Task<IActionResult> GetRandomImage([FromQuery]int width = 0, [FromQuery]int height = 0) {

			var images = await GetImageFileList();
			var index = new Random().Next(0, images.Count());
			var imageBytes = 
				await _azureImageService.GetImage(images.ElementAt(index));

			return File(imageBytes.Resize(width, height), "image/jpeg");
		}

		[HttpGet("{index}", Name = "GetImage")]
		public async Task<IActionResult> GetSpecificImage(int index, [FromQuery]int width = 0, [FromQuery]int height = 0) {

			var images = await GetImageFileList();
			if (index > images.Count) {
				return BadRequest($"There is no image at index {index}");
			}

			var imageBytes = await _azureImageService.GetImage(images.ElementAt(index));

			return File(imageBytes.Resize(width, height), "image/jpeg");
		}

		async Task<List<string>> GetImageFileList() {
			return await _azureImageService.GetImageNames();
		}

	}

	internal static class Extensions {

		internal static byte[] Resize(this byte[] imageBytes, int width, int height) {
			using (var image = new MagickImage(imageBytes)) {
				width = width == 0 ? image.Width : width;
				height = height == 0 ? image.Height : height;

				var ratio = (double)image.Width / image.Height;
				var scalePercentage = new Percentage(100);

				scalePercentage = width / height > ratio
					? new Percentage((double)height / image.Height * 100)
					: new Percentage((double)width / image.Width * 100);

				image.Resize(scalePercentage);
				return image.ToByteArray();
			}
		}
	}
}