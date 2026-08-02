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
    heroKicker: 'FPGA · 5G / O-RAN · V2X · DIGITAL TWINS · ISAC · ROBOTICS',
    heroName: 'Canh-Trung Nguyen',
    heroTagline: 'From logic gates to digital twins.',
    heroIntro:
      'For a decade I made radio work in silicon: 5G physical layers closing timing at 300 MHz, O-RAN radio units coming up on the bench. Today I lead the group that builds the digital twins those systems are tested inside — and applies them across robotics, automotive, drones and 5G/6G. The useful part is the overlap: simulation people rarely built the hardware, and hardware people rarely build the simulator.',
    heroRole: 'Manager & Tech Lead, Verticals Group — SoC.one, Hanoi',
    journeyLabel: 'The journey',
    currentLabel: 'Programs I lead today',
    chapters: [
      {
        era: 'CH.01',
        years: '2008 — 2017',
        title: 'Foundations — the gate',
        org: 'HUST, Hanoi → TU Kaiserslautern, Germany',
        story: [
          'Microelectronics at HUST, then embedded systems at TU Kaiserslautern — graduating at the top of the German scale.',
          'FPGA accelerator for intraday financial risk: 68× over the software it replaced, near one FLOP per cycle.',
          'Two habits started here: find the bottleneck first, and prove every speedup against a reference.',
        ],
        metrics: ['68× speedup @ 100 MHz', '1.087 cycles / FLOP', 'M.S. grade 1.5 — top band'],
      },
      {
        era: 'CH.02',
        years: '2017 — 2021',
        title: '5G PHY & Radio — the block',
        org: 'Viettel High Tech → VinSmart, Hanoi',
        story: [
          '5G NR base stations from the physical layer up, on Xilinx FPGAs.',
          'Led five engineers on PUSCH and PUCCH F3; a 2T2R digital front-end meeting the 3GPP spectrum mask.',
          'PDSCH bit-processing closing timing at 300 MHz, under 150 µs end to end; an 8T8R macrocell, two RRU generations.',
          'Learned to read a specification as an executable contract.',
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
        title: 'Acceleration & Vision — the ladder',
        org: 'Techvico (with a US imaging partner) → Avnet',
        story: [
          'A deliberate step up the ladder: hand-written VHDL to Vitis HLS.',
          'Three novel image-processing accelerators — disparity, defect-pixel, geometric transform — plus a streaming pipeline with the Xilinx DPU.',
          'FAE for AMD-Xilinx across Southeast Asia: a different vendor stack every few weeks, in front of customers.',
          'Learned to size unfamiliar silicon fast — and to explain it to people who don’t write RTL.',
        ],
        metrics: [
          '3 ISP accelerators in HLS',
          'AMD-Xilinx across SEA',
          'Customer-facing, multi-vendor',
        ],
      },
      {
        era: 'CH.04',
        years: '2021 — 2024',
        title: 'O-RAN Systems — the box',
        org: 'SoC.one, Hanoi',
        story: [
          'Joined SoC.one in 2021 — back to 5G, but as whole systems rather than blocks.',
          'FPGA acceleration for the 5G L1; O-DU and O-RU hardware platform bring-up.',
          'Fronthaul, timing domains, synchronisation — the seams where disaggregated base stations actually fail.',
          'The bench years that make an honest digital twin possible.',
        ],
        metrics: [
          '5G L1 FPGA acceleration',
          'O-DU / O-RU hardware bring-up',
          'O-RAN fronthaul & timing',
        ],
      },
      {
        era: 'CH.05',
        years: 'Late 2024 — present',
        title: 'Digital Twins & Verticals — the world',
        org: 'SoC.one, Hanoi',
        story: [
          'Run the Verticals Group — robotics, automotive, drones, 5G/6G — as manager, and tech lead where the decisions are hardest.',
          'Build the world before the product: GPU ray-traced radio channels inside network and vehicle digital twins.',
          'ISAC sensing models and a V2X sidelink stack traced clause by clause to 3GPP, ETSI and SAE.',
          'Sim-to-real robotics with measured transfer gates; the largest program grew 9 → ~20 engineers.',
        ],
        metrics: [
          'Verticals Group — 4 programs',
          'robotics · automotive · drones · 5G/6G',
          'largest program 9 → ~20 engineers',
          'Manager + hands-on tech lead',
        ],
      },
    ],
  },
  vi: {
    heroKicker: 'FPGA · 5G / O-RAN · V2X · DIGITAL TWIN · ISAC · ROBOTICS',
    heroName: 'Nguyễn Cảnh Trung',
    heroTagline: 'Từ cổng logic đến digital twin.',
    heroIntro:
      'Mười năm đầu, tôi làm cho sóng vô tuyến chạy được trong silicon: các lớp vật lý 5G đóng timing ở 300 MHz, những chiếc O-RAN radio unit sáng đèn trên bàn thí nghiệm. Hôm nay tôi dẫn dắt group xây chính những digital twin dùng để kiểm thử các hệ thống đó — và mang chúng vào robotics, automotive, drones và 5G/6G. Phần có giá trị nằm ở chỗ giao nhau: người làm mô phỏng hiếm khi từng dựng phần cứng, còn người làm phần cứng hiếm khi tự viết được simulator.',
    heroRole: 'Manager & Tech Lead, Verticals Group — SoC.one, Hà Nội',
    journeyLabel: 'Hành trình',
    currentLabel: 'Những chương trình tôi đang dẫn dắt',
    chapters: [
      {
        era: 'CH.01',
        years: '2008 — 2017',
        title: 'Nền móng — cổng logic',
        org: 'ĐH Bách khoa Hà Nội → TU Kaiserslautern, Đức',
        story: [
          'Tốt nghiệp Vi điện tử ở Bách khoa Hà Nội, sau đó hoàn thành thạc sĩ hệ thống nhúng tại TU Kaiserslautern — Đức.',
          'FPGA accelerator cho đánh giá rủi ro tài chính trong ngày: nhanh gấp 68 lần phần mềm nó thay thế, gần một FLOP mỗi chu kỳ.',
          'Hai thói quen bắt đầu từ đây: tìm điểm nghẽn trước đã, và mọi mức tăng tốc phải chứng minh bằng reference.',
        ],
        metrics: ['Tăng tốc 68× @ 100 MHz', '1.087 chu kỳ / FLOP', 'Điểm M.S. 1.5 — mức cao nhất'],
      },
      {
        era: 'CH.02',
        years: '2017 — 2021',
        title: '5G PHY & Radio — khối logic',
        org: 'Viettel High Tech → VinSmart, Hà Nội',
        story: [
          'Trạm gốc 5G NR từ lớp vật lý trở lên, trên FPGA Xilinx.',
          'Dẫn đội 5 kỹ sư làm PUSCH và PUCCH F3; digital front-end 2T2R đạt spectrum mask 3GPP.',
          'PDSCH bit-processing đóng timing ở 300 MHz, độ trễ dưới 150 µs; macrocell 8T8R, hai thế hệ RRU.',
          'Học được cách đọc spec như một bản hợp đồng thi hành được.',
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
        title: 'Acceleration & Vision — nấc thang',
        org: 'Techvico (cùng đối tác ISP tại Mỹ) → Avnet',
        story: [
          'Bước leo thang trừu tượng có chủ đích: từ VHDL viết tay lên Vitis HLS.',
          'Ba accelerator xử lý ảnh mới — disparity, defect-pixel, biến đổi hình học — cùng pipeline streaming ghép Xilinx DPU.',
          'FAE cho AMD-Xilinx khắp Đông Nam Á: vài tuần một vendor stack khác, đứng trước khách hàng.',
          'Học cách đánh giá nhanh công nghệ lạ — và giải thích silicon cho người không viết RTL.',
        ],
        metrics: [
          '3 ISP accelerator bằng HLS',
          'AMD-Xilinx khắp Đông Nam Á',
          'Làm việc trực tiếp với khách hàng, đa vendor',
        ],
      },
      {
        era: 'CH.04',
        years: '2021 — 2024',
        title: 'Hệ thống O-RAN — cả chiếc máy',
        org: 'SoC.one, Hà Nội',
        story: [
          'Gia nhập SoC.one năm 2021 — quay lại 5G, nhưng ở tầm cả hệ thống thay vì từng khối.',
          'Tăng tốc 5G L1 trên FPGA; bring-up nền tảng phần cứng O-DU và O-RU.',
          'Fronthaul, timing domain, đồng bộ — những đường nối nơi trạm gốc disaggregated thật sự hỏng.',
          'Những năm trên bàn thí nghiệm khiến một digital twin trung thực trở nên khả thi.',
        ],
        metrics: [
          'Tăng tốc 5G L1 trên FPGA',
          'Bring-up phần cứng O-DU / O-RU',
          'O-RAN fronthaul & timing',
        ],
      },
      {
        era: 'CH.05',
        years: 'Cuối 2024 — nay',
        title: 'Digital Twin & Verticals — cả thế giới',
        org: 'SoC.one, Hà Nội',
        story: [
          'Điều hành Verticals Group — robotics, automotive, drones, 5G/6G — làm manager, và tech lead ở nơi quyết định khó nhất.',
          'Dựng thế giới trước khi dựng sản phẩm: kênh vô tuyến ray-traced trên GPU trong digital twin của mạng và của xe.',
          'Mô hình ISAC sensing và V2X sidelink stack truy vết từng clause về 3GPP, ETSI, SAE.',
          'Robotics sim-to-real với gate chuyển giao đo được; chương trình lớn nhất từ 9 lên ~20 kỹ sư.',
        ],
        metrics: [
          'Verticals Group — 4 chương trình',
          'robotics · automotive · drones · 5G/6G',
          'chương trình lớn nhất 9 → ~20 kỹ sư',
          'Manager + tech lead trực chiến',
        ],
      },
    ],
  },
};
