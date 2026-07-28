import type { Locale } from '../i18n/ui';

export interface Chapter {
  era: string;
  years: string;
  title: string;
  org: string;
  story: string[];
  metrics: string[];
}

export interface JourneyContent {
  heroKicker: string;
  heroName: string;
  heroTagline: string;
  heroIntro: string;
  heroRole: string;
  journeyLabel: string;
  currentLabel: string;
  chapters: Chapter[];
}

export const journey: Record<Locale, JourneyContent> = {
  en: {
    heroKicker: 'FPGA · 5G PHY · V2X · DIGITAL TWINS · ROBOTICS',
    heroName: 'Canh-Trung Nguyen',
    heroTagline: 'From logic gates to connected systems.',
    heroIntro:
      'I started by pushing bits through FPGAs at hundreds of megahertz, and grew into leading teams that connect vehicles, simulate radio worlds, and teach robots to cross the sim-to-real gap. This page is that story, in order.',
    heroRole: 'Tech Lead — Connected Driving & Digital Twin · Hanoi, Vietnam',
    journeyLabel: 'The journey',
    currentLabel: 'What I lead today',
    chapters: [
      {
        era: 'CH.01',
        years: '2008 — 2017',
        title: 'Foundations',
        org: 'HUST, Hanoi → TU Kaiserslautern, Germany',
        story: [
          'Microelectronics at Hanoi University of Science and Technology, then a master’s in embedded systems at TU Kaiserslautern. The formative project came in a fintech research group: an FPGA accelerator for intraday financial correlation — the slowest step of a risk-assessment pipeline — streaming one floating-point number through the datapath nearly every cycle.',
          'That project set the theme for everything after it: find the bottleneck, then move it into silicon.',
        ],
        metrics: ['68× speedup @ 100 MHz', '1.087 cycles / FLOP', 'M.S. grade 1.5 (~92%)'],
      },
      {
        era: 'CH.02',
        years: '2017 — 2021',
        title: '5G PHY & Radio',
        org: 'Viettel High Tech → VinSmart, Hanoi',
        story: [
          'Building 5G NR base stations from the physical layer up, on Xilinx FPGAs. At Viettel I led a team of five implementing the L1 uplink data channel (PUSCH) and control channel (PUCCH format 3), and completed a 2T2R digital front-end — DPD, CFR, DUC — meeting the 3GPP spectrum mask.',
          'At VinSmart the radios got bigger: two remote radio unit generations on ADI RF transceivers, an 8T8R macrocell, and a three-engineer team delivering PDSCH bit-processing that closed timing at 300 MHz with end-to-end latency under 150 µs at the maximum transport block size.',
        ],
        metrics: [
          'PUSCH @ 250 MHz',
          'PDSCH @ 300 MHz · < 150 µs',
          '8T8R macrocell · 800 Mbps',
          'ACLR 50 dB (3GPP-compliant DFE)',
        ],
      },
      {
        era: 'CH.03',
        years: '2021 — 2022',
        title: 'Acceleration & Vision',
        org: 'Techvico (with Pinnacle ISP, USA) → Avnet',
        story: [
          'A deliberate step up the abstraction ladder: from hand-written VHDL to high-level synthesis. With Pinnacle ISP I implemented novel image-processing algorithms — disparity, defect-pixel correction, geometric transformation — as Vitis HLS accelerators, and prototyped a streaming pipeline pairing them with the Xilinx DPU.',
          'As a field application engineer at Avnet I covered AMD-Xilinx across Southeast Asia: AI vision demos on Kria (face recognition, ANPR), a 5G testbed PoC on Quartus and Catapult, PCIe with Intel’s MCDMA — and learned to explain silicon to people who don’t write RTL.',
        ],
        metrics: ['3 ISP accelerators in HLS', 'Kria AI vision (ANPR, faces)', 'PoC 5G testbed'],
      },
      {
        era: 'CH.04',
        years: '2021 — 2024',
        title: 'O-RAN Systems',
        org: 'SoC.one, Hanoi',
        story: [
          'I joined SoC.one in 2021 — part-time at first, full-time by the end of that year — going back to 5G, but this time as systems: FPGA-based acceleration for the 5G L1, then bringing up O-DU and O-RU hardware platforms in the O-RAN architecture.',
          'The work shifted from making one channel close timing to making whole boxes work — hardware, timing domains, fronthaul, and the software that has to trust all of it.',
        ],
        metrics: ['5G L1 FPGA acceleration', 'O-DU / O-RU hardware bring-up', 'O-RAN architecture'],
      },
      {
        era: 'CH.05',
        years: 'Late 2024 — present',
        title: 'Tech Lead',
        org: 'SoC.one, Hanoi',
        story: [
          'Since late 2024 I lead engineering across four programs: connected driving over the C-V2X PC5 sidelink, a standards-first V2X protocol stack, digital twins with ray-traced radio channels, and sim-to-real robotics. Different domains, one thread — systems where the physical world and the computed one must agree.',
          'The projects below are described at the level I can share publicly: technologies and standards, not customers or internals.',
        ],
        metrics: ['4 programs', 'C-V2X · DT · Robotics · Protocols'],
      },
    ],
  },
  vi: {
    heroKicker: 'FPGA · 5G PHY · V2X · DIGITAL TWIN · ROBOTICS',
    heroName: 'Nguyễn Cảnh Trung',
    heroTagline: 'Từ cổng logic đến những hệ thống kết nối.',
    heroIntro:
      'Tôi bắt đầu bằng việc đẩy từng bit qua FPGA ở tần số hàng trăm megahertz, rồi trưởng thành thành người dẫn dắt những đội ngũ kết nối xe hơi, mô phỏng thế giới sóng vô tuyến, và dạy robot vượt qua khoảng cách sim-to-real. Trang này kể lại câu chuyện đó, theo đúng trình tự.',
    heroRole: 'Tech Lead — Connected Driving & Digital Twin · Hà Nội, Việt Nam',
    journeyLabel: 'Hành trình',
    currentLabel: 'Những gì tôi đang dẫn dắt',
    chapters: [
      {
        era: 'CH.01',
        years: '2008 — 2017',
        title: 'Nền móng',
        org: 'ĐH Bách khoa Hà Nội → TU Kaiserslautern, Đức',
        story: [
          'Vi điện tử ở Bách khoa Hà Nội, rồi thạc sĩ hệ thống nhúng tại TU Kaiserslautern. Dự án định hình nhất đến từ nhóm nghiên cứu fintech: một bộ tăng tốc FPGA tính tương quan tài chính trong ngày — bước chậm nhất của pipeline đánh giá rủi ro — đẩy gần như mỗi chu kỳ một số dấu phẩy động qua datapath.',
          'Dự án ấy đặt ra chủ đề cho mọi thứ về sau: tìm ra điểm nghẽn, rồi đưa nó vào silicon.',
        ],
        metrics: ['Tăng tốc 68× @ 100 MHz', '1.087 chu kỳ / FLOP', 'Điểm M.S. 1.5 (~92%)'],
      },
      {
        era: 'CH.02',
        years: '2017 — 2021',
        title: '5G PHY & Radio',
        org: 'Viettel High Tech → VinSmart, Hà Nội',
        story: [
          'Xây trạm gốc 5G NR từ lớp vật lý trở lên, trên FPGA Xilinx. Ở Viettel tôi dẫn dắt đội 5 kỹ sư triển khai kênh dữ liệu uplink L1 (PUSCH) và kênh điều khiển (PUCCH format 3), hoàn thành digital front-end 2T2R — DPD, CFR, DUC — đạt mặt nạ phổ theo chuẩn 3GPP.',
          'Sang VinSmart, radio lớn dần: hai thế hệ khối thu phát vô tuyến (RRU) trên transceiver ADI, macrocell 8T8R, và đội 3 kỹ sư hoàn thành PDSCH bit-processing đóng timing ở 300 MHz với độ trễ đầu-cuối dưới 150 µs ở kích thước transport block tối đa.',
        ],
        metrics: [
          'PUSCH @ 250 MHz',
          'PDSCH @ 300 MHz · < 150 µs',
          'Macrocell 8T8R · 800 Mbps',
          'ACLR 50 dB (DFE đạt chuẩn 3GPP)',
        ],
      },
      {
        era: 'CH.03',
        years: '2021 — 2022',
        title: 'Tăng tốc & Thị giác máy',
        org: 'Techvico (cùng Pinnacle ISP, Mỹ) → Avnet',
        story: [
          'Một bước leo thang trừu tượng có chủ đích: từ VHDL viết tay lên high-level synthesis. Cùng Pinnacle ISP, tôi triển khai các thuật toán xử lý ảnh mới — disparity, sửa điểm ảnh lỗi, biến đổi hình học — thành các bộ tăng tốc Vitis HLS, và dựng nguyên mẫu pipeline streaming ghép chúng với Xilinx DPU.',
          'Ở vai trò field application engineer tại Avnet, tôi phụ trách AMD-Xilinx khắp Đông Nam Á: demo AI vision trên Kria (nhận diện khuôn mặt, ANPR), PoC 5G testbed trên Quartus và Catapult, PCIe với MCDMA của Intel — và học cách giải thích silicon cho những người không viết RTL.',
        ],
        metrics: ['3 bộ tăng tốc ISP bằng HLS', 'AI vision trên Kria (ANPR, khuôn mặt)', 'PoC 5G testbed'],
      },
      {
        era: 'CH.04',
        years: '2021 — 2024',
        title: 'Hệ thống O-RAN',
        org: 'SoC.one, Hà Nội',
        story: [
          'Tôi gia nhập SoC.one năm 2021 — ban đầu part-time, đến cuối năm thì full-time — quay lại với 5G, nhưng lần này ở tầm hệ thống: tăng tốc 5G L1 trên FPGA, rồi dựng các nền tảng phần cứng O-DU và O-RU theo kiến trúc O-RAN.',
          'Công việc chuyển từ việc làm một kênh đóng được timing sang việc làm cả một chiếc máy chạy được — phần cứng, các miền thời gian, fronthaul, và phần mềm phải tin tưởng được tất cả những thứ đó.',
        ],
        metrics: ['Tăng tốc 5G L1 trên FPGA', 'Bring-up phần cứng O-DU / O-RU', 'Kiến trúc O-RAN'],
      },
      {
        era: 'CH.05',
        years: 'Cuối 2024 — nay',
        title: 'Tech Lead',
        org: 'SoC.one, Hà Nội',
        story: [
          'Từ cuối 2024, tôi dẫn dắt kỹ thuật của bốn chương trình: connected driving qua sidelink C-V2X PC5, một protocol stack V2X bám chặt chuẩn, digital twin với kênh vô tuyến ray-tracing, và robotics sim-to-real. Các lĩnh vực khác nhau, một sợi chỉ chung — những hệ thống nơi thế giới vật lý và thế giới tính toán phải khớp nhau.',
          'Các dự án dưới đây được mô tả ở mức có thể chia sẻ công khai: công nghệ và chuẩn, không phải khách hàng hay chi tiết nội bộ.',
        ],
        metrics: ['4 chương trình', 'C-V2X · DT · Robotics · Protocols'],
      },
    ],
  },
};
